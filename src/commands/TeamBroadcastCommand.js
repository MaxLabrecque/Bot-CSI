import { ChannelType } from "discord.js";
import config from "../config.js";
import { findModRole } from "../utils/permissions.js";
import { isTeamChannel, teamChannelLabel } from "../utils/teams.js";

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

  const message = interaction.options.getString("message", true);
  const targets = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildText && isTeamChannel(c.name)
  );

  if (!targets.size) {
    return interaction.reply({
      content: `Aucun canal correspondant trouvé (${teamChannelLabel()}).`,
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: `Envoi du message vers ${targets.size} canal(aux)...`,
    ephemeral: true,
  });

  const results = await Promise.allSettled(
    targets.map((ch) => ch.send({ content: message }))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - succeeded;

  await interaction.followUp({
    content: `Terminé — succès: ${succeeded}, échec: ${failed}.`,
    ephemeral: true,
  });
}
