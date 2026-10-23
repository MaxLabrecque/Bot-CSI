import { ChannelType, PermissionFlagsBits } from "discord.js";
import config from "../config.js";
import { createConfirmButtons } from "../buttons/ConfirmButtons.js";
import {
  createTeam,
  deleteTeamByChannelId,
  getTeamByChannelId,
  listTeams,
} from "../db/teams.js";
import { findAdminRole, findModRole, hasModRole } from "../utils/permissions.js";
import { teamChannelName, teamNumber } from "../utils/teams.js";

const MAX_TEAMS = 99;
const PENDING_TTL_MS = 5 * 60 * 1000;
const MEMBER_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.AttachFiles,
];

/**
 * Team deletions waiting for confirmation, by interaction id
 * @type {Map<string, {action: "remove"|"prune", userId: string, channelId?: string}>}
 */
const pendingDeletions = new Map();

/**
 * Reply an error if the member is not moderator
 *
 * @param interaction The interaction
 * @returns {Promise<boolean>} true if the member can use the command
 */
async function checkModerator(interaction) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return false;
  }
  if (!hasModRole(interaction.member)) {
    await interaction.reply({
      content: `Vous devez avoir le rôle '${config.moderatorRole}' pour utiliser cette commande.`,
      ephemeral: true,
    });
    return false;
  }
  return true;
}

/**
 * Delete the saved teams whose channel does not exist anymore (deleted by hand)
 *
 * @param guild The guild
 */
function deleteOrphanTeams(guild) {
  for (const team of listTeams()) {
    if (!guild.channels.cache.has(team.channel_id)) deleteTeamByChannelId(team.channel_id);
  }
}

/**
 * Find the first team number without a channel. An existing role with this
 * number is reused by /register-team.
 *
 * @param guild The guild
 * @returns {number|null} The number, or null if all are used
 */
function nextFreeTeamNumber(guild) {
  const used = new Set(guild.channels.cache.map((c) => teamNumber(c.name)));
  for (let number = 1; number <= MAX_TEAMS; number++) {
    if (!used.has(number)) return number;
  }
  return null;
}

/**
 * Find the role of a team: the saved one, or the role with the channel name
 *
 * @param guild The guild
 * @param channel The team channel
 * @returns The role, or undefined if not found
 */
function findTeamRole(guild, channel) {
  const team = getTeamByChannelId(channel.id);
  if (team) return guild.roles.cache.get(team.role_id);
  return guild.roles.cache.find((r) => r.name === channel.name);
}

/**
 * Definition for the /register-team command: create the role and the channel
 * of a new team and give the role to the members
 *
 * @param interaction The interaction object of the command
 * @param client The client object of the bot
 */
async function registerTeamCommand(interaction, client) {
  if (!(await checkModerator(interaction))) return;
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const name = interaction.options.getString("name", true).trim();
  const membersInput = interaction.options.getString("members", true);
  const ids = [...new Set([...membersInput.matchAll(/<@!?(\d+)>/g)].map((m) => m[1]))];

  if (!ids.length) {
    return interaction.editReply(
      "Aucun membre mentionné. Exemple : `members: @joueur1 @joueur2`",
    );
  }

  const members = [];
  const notFound = [];
  for (const id of ids) {
    try {
      members.push(await guild.members.fetch(id));
    } catch {
      notFound.push(id);
    }
  }

  deleteOrphanTeams(guild);
  const number = nextFreeTeamNumber(guild);
  if (number === null) {
    return interaction.editReply(`Plus de numéro d'équipe disponible (max ${MAX_TEAMS}).`);
  }
  const channelName = teamChannelName(number);

  // Reuse the role equipe-XX if it already exists without channel
  let role = guild.roles.cache.find((r) => r.name === channelName);
  const roleReused = !!role;
  let channel;
  try {
    role ??= await guild.roles.create({ name: channelName, reason: `Équipe ${name}` });

    // Hidden from everyone except the team, the staff and the bot
    const overwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: role.id, allow: MEMBER_PERMISSIONS },
      { id: client.user.id, allow: MEMBER_PERMISSIONS },
    ];
    for (const staffRole of [findModRole(guild), findAdminRole(guild)]) {
      if (staffRole && !overwrites.some((o) => o.id === staffRole.id)) {
        overwrites.push({ id: staffRole.id, allow: MEMBER_PERMISSIONS });
      }
    }

    channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: config.teamCategoryId ?? undefined,
      topic: `Équipe : ${name}`,
      permissionOverwrites: overwrites,
      reason: `Équipe ${name}`,
    });
  } catch (error) {
    console.error("Team creation failed", error);
    if (!roleReused) await role?.delete().catch(() => {});
    return interaction.editReply(
      "Erreur lors de la création de l'équipe. Vérifiez que le bot a les permissions " +
        "« Gérer les rôles » et « Gérer les salons », et que `TEAM_CATEGORY_ID` est valide.",
    );
  }

  // Category: the role can see it, but only the channels allowing the role.
  // Permissions are computed from each channel's own overwrites, so this
  // does not open the other channels of the category.
  let categoryFailed = false;
  if (config.teamCategoryId) {
    try {
      const category = await guild.channels.fetch(config.teamCategoryId);
      await category.permissionOverwrites.edit(role, { ViewChannel: true });
    } catch (error) {
      console.error("Category permission failed", error);
      categoryFailed = true;
    }
  }

  const results = await Promise.allSettled(members.map((m) => m.roles.add(role)));
  const failed = members.filter((_, i) => results[i].status === "rejected");

  createTeam({ number, name, channelId: channel.id, roleId: role.id });

  await channel.send({
    content:
      `Bienvenue **${name}** ! ${members.map((m) => `<@${m.id}>`).join(" ")}\n\n` +
      "Ceci est le channel privé de votre équipe. Pour demander de l'aide aux organisateurs, " +
      "utilisez `/help challenge:<nom du challenge>` ici.",
    allowedMentions: { users: members.map((m) => m.id) },
  });

  const lines = [
    `Équipe **${name}** créée : ${channel} avec le rôle ${role}` +
      (roleReused ? " (rôle existant réutilisé)." : "."),
  ];
  lines.push(`${members.length - failed.length} membre(s) ajouté(s).`);
  if (notFound.length) lines.push(`Introuvable(s) : ${notFound.map((id) => `<@${id}>`).join(" ")}`);
  if (failed.length) lines.push(`Rôle non attribué à : ${failed.map((m) => `<@${m.id}>`).join(" ")}`);
  if (categoryFailed) lines.push("⚠️ Impossible d'ajouter le rôle sur la catégorie.");
  await interaction.editReply({ content: lines.join("\n"), allowedMentions: { parse: [] } });
}

/**
 * Definition for the /add-member command: give the team role to a member
 *
 * @param interaction The interaction object of the command
 */
async function addMemberCommand(interaction) {
  if (!(await checkModerator(interaction))) return;

  const channel = interaction.options.getChannel("team", true);
  const user = interaction.options.getUser("member", true);

  if (teamNumber(channel.name) === null) {
    return interaction.reply({ content: `${channel} n'est pas un channel d'équipe.`, ephemeral: true });
  }

  const role = findTeamRole(interaction.guild, channel);
  if (!role) {
    return interaction.reply({ content: `Rôle de l'équipe ${channel} introuvable.`, ephemeral: true });
  }

  try {
    const member = await interaction.guild.members.fetch(user.id);
    await member.roles.add(role);
  } catch (error) {
    console.error("Add member failed", error);
    return interaction.reply({
      content: `Impossible d'ajouter ${user} à ${channel}.`,
      ephemeral: true,
      allowedMentions: { parse: [] },
    });
  }

  // Welcome message in the team channel, tagging the new member
  let welcomeFailed = false;
  try {
    const teamChannel = await interaction.guild.channels.fetch(channel.id);
    const team = getTeamByChannelId(channel.id);
    await teamChannel.send({
      content:
        `Bienvenue <@${user.id}> ! Tu as été ajouté à l'équipe **${team?.name ?? channel.name}**.` +
        "\nPour demander de l'aide aux organisateurs, utilise `/help challenge:<nom du challenge>` ici.",
      allowedMentions: { users: [user.id] },
    });
  } catch (error) {
    console.error("Add member welcome failed", error);
    welcomeFailed = true;
  }

  await interaction.reply({
    content:
      `${user} ajouté à ${channel}.` +
      (welcomeFailed ? "\n⚠️ Impossible d'envoyer le message de bienvenue." : ""),
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}

/**
 * Definition for the /remove-team command: ask confirmation to delete a team
 *
 * @param interaction The interaction object of the command
 */
async function removeTeamCommand(interaction) {
  if (!(await checkModerator(interaction))) return;

  const channel = interaction.options.getChannel("team", true);
  if (teamNumber(channel.name) === null) {
    return interaction.reply({ content: `${channel} n'est pas un channel d'équipe.`, ephemeral: true });
  }

  const role = findTeamRole(interaction.guild, channel);
  pendingDeletions.set(interaction.id, {
    action: "remove",
    userId: interaction.user.id,
    channelId: channel.id,
  });
  setTimeout(() => pendingDeletions.delete(interaction.id), PENDING_TTL_MS);

  await interaction.reply({
    content: `Supprimer le channel ${channel}${role ? ` et le rôle ${role}` : ""} ? Cette action est irréversible.`,
    components: [createConfirmButtons("teams", interaction.id)],
    ephemeral: true,
    allowedMentions: { parse: [] },
  });
}

/**
 * Get the team channels and roles removed by /prune-teams: the numbered ones
 * (equipe-XX), never the extra ones (equipe-test)
 *
 * @param guild The guild
 */
function getPruneTargets(guild) {
  return {
    channels: guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText && teamNumber(c.name) !== null,
    ),
    roles: guild.roles.cache.filter((r) => teamNumber(r.name) !== null),
  };
}

/**
 * Definition for the /prune-teams command: ask confirmation to delete all the
 * numbered team channels and roles
 *
 * @param interaction The interaction object of the command
 */
async function pruneTeamsCommand(interaction) {
  if (!(await checkModerator(interaction))) return;

  const { channels, roles } = getPruneTargets(interaction.guild);
  if (!channels.size && !roles.size) {
    return interaction.reply({ content: "Aucune équipe à supprimer.", ephemeral: true });
  }

  pendingDeletions.set(interaction.id, { action: "prune", userId: interaction.user.id });
  setTimeout(() => pendingDeletions.delete(interaction.id), PENDING_TTL_MS);

  const names = channels.map((c) => c.name).sort().join(", ");
  await interaction.reply({
    content:
      `Supprimer **${channels.size} channel(s)** et **${roles.size} rôle(s)** d'équipe ? ` +
      "Cette action est irréversible.\n" +
      (names.length > 1500 ? names.slice(0, 1499) + "…" : names),
    components: [createConfirmButtons("teams", interaction.id)],
    ephemeral: true,
  });
}

/**
 * Delete channels and roles, and the saved teams of the channels
 *
 * @param channels The channels to delete
 * @param roles The roles to delete
 * @returns The number of deleted channels and roles, and the failures
 */
async function deleteTeams(channels, roles) {
  const channelResults = await Promise.allSettled(
    channels.map(async (c) => {
      await c.delete("Suppression d'équipe");
      deleteTeamByChannelId(c.id);
    }),
  );
  const roleResults = await Promise.allSettled(roles.map((r) => r.delete("Suppression d'équipe")));
  const ok = (results) => results.filter((r) => r.status === "fulfilled").length;
  return {
    channels: ok(channelResults),
    roles: ok(roleResults),
    failed: channelResults.length + roleResults.length - ok(channelResults) - ok(roleResults),
  };
}

/**
 * Handle the Confirmer / Annuler buttons of /remove-team and /prune-teams
 *
 * @param client The client object of the bot
 * @param interaction The button interaction
 */
async function handleTeamsButton(client, interaction) {
  const [action, id] = interaction.customId.split(":");
  const pending = pendingDeletions.get(id);

  if (!pending) {
    return interaction.update({ content: "Cette demande a expiré, relancez la commande.", components: [] });
  }
  pendingDeletions.delete(id);

  if (action === "teams-cancel") {
    return interaction.update({ content: "Suppression annulée.", components: [] });
  }

  await interaction.update({ content: "Suppression en cours...", components: [] });

  const guild = interaction.guild;
  let channels = [];
  let roles = [];
  if (pending.action === "remove") {
    const channel = guild.channels.cache.get(pending.channelId);
    if (channel) {
      channels = [channel];
      const role = findTeamRole(guild, channel);
      if (role) roles = [role];
    }
  } else {
    const targets = getPruneTargets(guild);
    channels = [...targets.channels.values()];
    roles = [...targets.roles.values()];
  }

  const result = await deleteTeams(channels, roles);
  deleteOrphanTeams(guild);
  const summary =
    `Supprimé : ${result.channels} channel(s), ${result.roles} rôle(s)` +
    (result.failed ? ` — ${result.failed} échec(s) (rôle du bot trop bas ?)` : "");

  // The reply is gone if the command was used in a deleted channel
  await interaction.editReply(summary).catch(() => {});

  try {
    const logChannel = await client.channels.fetch(config.logChannelId);
    const what = pending.action === "prune" ? "/prune-teams" : "/remove-team";
    await logChannel.send({
      content: `🗑️ ${what} par <@${pending.userId}> — ${summary}`,
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    console.error("Teams log failed", error);
  }
}

export {
  addMemberCommand,
  handleTeamsButton,
  pruneTeamsCommand,
  registerTeamCommand,
  removeTeamCommand,
};
