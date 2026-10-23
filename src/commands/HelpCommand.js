import { CreateNewTicketsEmbed } from "../embed/EmbedNewTickets.js";
import { createButtonAcceptTickets } from "../buttons/AcceptTicketsButton.js";
import { createPrisTicketEmbed } from "../embed/EmbedPrisTickets.js";
import { createButtonsClosedTickets } from "../buttons/ClosedTicketsButtons.js";
import { CreateClosedTicketsEmbed } from "../embed/EmbedClosedTickets.js";

const ticketHistory = new Map();

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

  const logChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);

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

  ticketHistory.set(sentMessage.id, {
    channelId: interaction.channel.id,
    channelName: interaction.channel.name,
    userId: interaction.user.id,
    userName: interaction.user.username,
    challengeName: challengeNameInput,
    timestamp: Date.now(),
    status: "open",
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
    const ticketInfo = ticketHistory.get(interaction.message.id);

    if (!ticketInfo) {
      console.error("Ticket not found in history");
      await interaction.reply({
        content: "Erreur: ticket introuvable dans l'historique",
        ephemeral: true,
      });
      return;
    }

    if (ticketInfo.status !== "open") {
      await interaction.reply({
        content: "Ce ticket a déjà été pris",
        ephemeral: true,
      });
      return;
    }

    // Update ticket status
    ticketInfo.status = "taken";
    ticketInfo.takenBy = interaction.user.id;
    ticketInfo.takenAt = Date.now();

    const originalChannelId = interaction.message.embeds[0].fields[0].value;

    await interaction.update(
      {
        embeds: [
          createPrisTicketEmbed(ticketInfo.channelName, interaction.user),
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
    const ticketInfo = ticketHistory.get(interaction.message.id);

    if (!ticketInfo) {
      console.error("Ticket not found in history");
      await interaction.reply({
        content: "Erreur: ticket introuvable dans l'historique",
        ephemeral: true,
      });
      return;
    }

    ticketInfo.status = "closed";

    await interaction.update(
      {
        embeds: [
          CreateClosedTicketsEmbed(ticketInfo.channelName, interaction.user),
        ],
        components: [],
      },
    );
  }
}

export { handleBoutonHelp, helpCommand };
