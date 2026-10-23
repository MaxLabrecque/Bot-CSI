import { ChannelType, EmbedBuilder } from "discord.js";
import config from "../config.js";
import { createBroadcastButtons } from "../buttons/BroadcastButtons.js";
import { createBroadcastModal } from "../modals/BroadcastModal.js";
import { findModRole } from "../utils/permissions.js";
import { isTeamChannel, teamChannelLabel } from "../utils/teams.js";

const PENDING_TTL_MS = 5 * 60 * 1000;

/**
 * Broadcasts waiting for the modal or the confirmation, by interaction id
 * @type {Map<string, {userId: string, teamId: string|null, title: string|null, attachment: {url: string, name: string}|null, message?: string}>}
 */
const pendingBroadcasts = new Map();

/**
 * Get the channels a broadcast is sent to
 *
 * @param guild The guild
 * @param pending The pending broadcast
 * @returns The target channels
 */
function getTargets(guild, pending) {
  return guild.channels.cache.filter(
    (c) =>
      c.type === ChannelType.GuildText &&
      isTeamChannel(c.name) &&
      (!pending.teamId || c.id === pending.teamId),
  );
}

/**
 * Build the message sent to the teams: an embed if there is a title, plain text otherwise
 *
 * @param pending The pending broadcast
 * @returns The message options
 */
function buildPayload(pending) {
  const files = pending.attachment
    ? [{ attachment: pending.attachment.url, name: pending.attachment.name }]
    : [];

  if (pending.title) {
    const embed = new EmbedBuilder()
      .setTitle(pending.title)
      .setDescription(pending.message)
      .setColor("#5865f2");
    return { embeds: [embed], files };
  }
  return { content: pending.message, files };
}

/**
 * Definition for the /team-broadcast command: open the modal to write the message
 *
 * @param interaction The interaction object of the command
 */
export async function sendBroadcastMessage(interaction) {
  const guild = interaction.guild;
  if (!guild) {
    return interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
  }

  const modRole = findModRole(guild);
  if (!modRole) {
    return interaction.reply({
      content: `Rôle "${config.moderatorRole}" introuvable sur ce serveur.`,
      ephemeral: true,
    });
  }
  if (!interaction.member.roles.cache.has(modRole.id)) {
    return interaction.reply({
      content: `Vous devez avoir le rôle '${config.moderatorRole}' pour utiliser cette commande.`,
      ephemeral: true,
    });
  }

  const team = interaction.options.getChannel("team");
  if (team && !isTeamChannel(team.name)) {
    return interaction.reply({
      content: `${team} n'est pas un channel d'équipe (${teamChannelLabel()}).`,
      ephemeral: true,
    });
  }

  const title = interaction.options.getString("title");
  const attachment = interaction.options.getAttachment("attachment");

  pendingBroadcasts.set(interaction.id, {
    userId: interaction.user.id,
    teamId: team?.id ?? null,
    title,
    attachment: attachment ? { url: attachment.url, name: attachment.name } : null,
  });
  setTimeout(() => pendingBroadcasts.delete(interaction.id), PENDING_TTL_MS);

  // Plain text: 2000 max per message, minus room for the preview header
  await interaction.showModal(createBroadcastModal(interaction.id, title ? 4000 : 1900));
}

/**
 * Handle the broadcast modal: show a preview with the Envoyer / Annuler buttons
 *
 * @param interaction The modal submit interaction
 */
export async function handleBroadcastModal(interaction) {
  const id = interaction.customId.split(":")[1];
  const pending = pendingBroadcasts.get(id);
  if (!pending) {
    return interaction.reply({
      content: "Ce broadcast a expiré, relancez la commande.",
      ephemeral: true,
    });
  }

  pending.message = interaction.fields.getTextInputValue("message");
  const targets = getTargets(interaction.guild, pending);

  if (!targets.size) {
    pendingBroadcasts.delete(id);
    return interaction.reply({
      content: `Aucun canal correspondant trouvé (${teamChannelLabel()}).`,
      ephemeral: true,
    });
  }

  const payload = buildPayload(pending);
  await interaction.reply({
    ...payload,
    content:
      `**Aperçu** — envoi vers ${pending.teamId ? targets.first().name : `${targets.size} channel(s)`}\n\n` +
      (payload.content ?? ""),
    components: [createBroadcastButtons(id)],
    allowedMentions: { parse: [] },
    ephemeral: true,
  });
}

/**
 * Handle the Envoyer / Annuler buttons of the broadcast preview
 *
 * @param client The client object of the bot
 * @param interaction The button interaction
 */
export async function handleBroadcastButton(client, interaction) {
  const [action, id] = interaction.customId.split(":");
  const pending = pendingBroadcasts.get(id);

  if (!pending || !pending.message) {
    return interaction.update({
      content: "Ce broadcast a expiré, relancez la commande.",
      embeds: [],
      attachments: [],
      components: [],
    });
  }

  pendingBroadcasts.delete(id);

  if (action === "broadcast-cancel") {
    return interaction.update({
      content: "Broadcast annulé.",
      embeds: [],
      attachments: [],
      components: [],
    });
  }

  const targets = getTargets(interaction.guild, pending);
  await interaction.update({
    content: `Envoi du message vers ${targets.size} channel(s)...`,
    embeds: [],
    attachments: [],
    components: [],
  });

  const payload = buildPayload(pending);
  const results = await Promise.allSettled(targets.map((ch) => ch.send(payload)));
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;

  await interaction.editReply(`Terminé — succès: ${succeeded}, échec: ${failed}.`);

  try {
    const logChannel = await client.channels.fetch(config.logChannelId);
    const preview = pending.message.length > 200
      ? pending.message.slice(0, 199) + "…"
      : pending.message;
    await logChannel.send({
      content:
        `📢 Broadcast par <@${pending.userId}> vers ${targets.size} channel(s) — succès: ${succeeded}, échec: ${failed}\n` +
        (pending.title ? `**${pending.title}**\n` : "") +
        `>>> ${preview}`,
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    console.error("Broadcast log failed", error);
  }
}
