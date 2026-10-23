import config from "../config.js";
import { listActiveTickets } from "../db/tickets.js";
import { createTicketsDashboardEmbed } from "../embed/EmbedTicketsDashboard.js";
import { isStaff } from "../utils/permissions.js";

/**
 * Definition for the /tickets command: list the open and taken tickets
 *
 * @param interaction The interaction object of the command
 */
async function ticketsCommand(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
  }

  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: `Vous devez avoir le rôle '${config.moderatorRole}' pour utiliser cette commande.`,
      ephemeral: true,
    });
  }

  const status = interaction.options.getString("status") ?? "all";
  const tickets = listActiveTickets(status);

  if (!tickets.length) {
    return interaction.reply({
      content: "Aucun ticket en cours.",
    });
  }

  await interaction.reply({
    embeds: [createTicketsDashboardEmbed(tickets, interaction.guildId)],
  });
}

export { ticketsCommand };
