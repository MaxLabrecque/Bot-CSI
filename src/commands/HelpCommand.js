import { CreateNewTicketsEmbed } from "../embed/EmbedNewTickets.js";
import { createButtonAcceptTickets } from "../buttons/AcceptTicketsButton.js";
import { createPrisTicketEmbed } from "../embed/EmbedPrisTickets.js";
import { createButtonsClosedTickets } from "../buttons/ClosedTicketsButtons.js";
import { CreateClosedTicketsEmbed } from "../embed/EmbedClosedTickets.js";
import config from "../config.js";
import {
  closeTicket,
  createTicket,
  getTicketByMessageId,
  takeTicket,
} from "../db/tickets.js";

/**
 * Definition for the /help command
 *
 * @param interaction The interaction object of the command
 * @param client The client object of the bot
 */
async function helpCommand(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const challengeNameInput = interaction.options.getString("challenge");
  if (!challengeNameInput) {
    await interaction.editReply("Veuillez renseigner le nom du challenge");
    return;
  }

  const logChannel = await client.channels.fetch(config.logChannelId);

  const sentMessage = await logChannel.send(
    {
      embeds: [
        CreateNewTicketsEmbed(
          interaction.channel.name,
          interaction.channel.id,
          challengeNameInput,
        ),
      ],
      components: [createButtonAcceptTickets()],
    },
  );

  createTicket({
    logMessageId: sentMessage.id,
    channelId: interaction.channel.id,
    channelName: interaction.channel.name,
    userId: interaction.user.id,
    userName: interaction.user.username,
    challenge: challengeNameInput,
  });

  await interaction.editReply("Ticket envoyé !");
}

/**
 * Handle the buttons of the help command
 *
 * @param client The client object of the bot
 * @param interaction The interaction object of the button from the help embed messages
 * @returns {Promise<void>} A promise to send to the user
 */
async function handleBoutonHelp(client, interaction) {
  if (interaction.customId === "take") {
    const ticketInfo = getTicketByMessageId(interaction.message.id);

    if (!ticketInfo) {
      console.error("Ticket not found in history");
      await interaction.reply({
        content: "Erreur: ticket introuvable dans l'historique",
        ephemeral: true,
      });
      return;
    }

    if (!takeTicket(interaction.message.id, interaction.user.id)) {
      await interaction.reply({
        content: "Ce ticket a déjà été pris",
        ephemeral: true,
      });
      return;
    }

    const originalChannelId = ticketInfo.channel_id;

    await interaction.update(
      {
        embeds: [
          createPrisTicketEmbed(ticketInfo.channel_name, interaction.user),
        ],
        components: [createButtonsClosedTickets()],
      },
    );

    let channel = null;
    if (originalChannelId) {
      channel = await client.channels.fetch(originalChannelId);
      await channel.send("Ticket pris par <@" + interaction.user.id + ">");
    }
  }

  if (interaction.customId === "closed") {
    const ticketInfo = getTicketByMessageId(interaction.message.id);

    if (!ticketInfo) {
      console.error("Ticket not found in history");
      await interaction.reply({
        content: "Erreur: ticket introuvable dans l'historique",
        ephemeral: true,
      });
      return;
    }

    if (!closeTicket(interaction.message.id, interaction.user.id)) {
      await interaction.reply({
        content: "Ce ticket est déjà fermé",
        ephemeral: true,
      });
      return;
    }

    await interaction.update(
      {
        embeds: [
          CreateClosedTicketsEmbed(ticketInfo.channel_name, interaction.user),
        ],
        components: [],
      },
    );
  }
}

export { handleBoutonHelp, helpCommand };
