import dotenv from 'dotenv';

dotenv.config({path: '../../.env'});
import {CreateNewTicketsEmbed} from '../embed/EmbedNewTickets.js';
import {createButtonsAcceptTickets} from '../buttons/AcceptTicketsButton.js';
import {createPrisTicketEmbed} from '../embed/EmbedPrisTickets.js';
import {createButtonsClosedTickets} from '../buttons/ClosedTicketsButtons.js';
import {CreateClosedTicketsEmbed} from '../embed/EmbedClosedTickets.js';

/**
 * @param {import('discord.js').Interaction} interaction
 * @param interaction
 * @param client
 */
async function helpCommand(interaction, client) {
  await interaction.deferReply({ephemeral: true});

  await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send(
      {
        embeds: [CreateNewTicketsEmbed(interaction.channel.name)],
        components: [createButtonsAcceptTickets()],
      });

  await interaction.editReply("Tickets envoyes !")
}

async function handleBoutonHelp(client, interaction) {
    if (interaction.customId === 'take') {
      await interaction.update(
          {
            embeds: [
              createPrisTicketEmbed(interaction.channel.name,
                  interaction.user)],
            components: [createButtonsClosedTickets()],
          });
    }
    if (interaction.customId === 'closed') {
      await interaction.update(
          {
            embeds: [
              CreateClosedTicketsEmbed(interaction.channel.name,
                  interaction.user)],
            components: [],
          },
      );
    }
}

export {helpCommand, handleBoutonHelp};
