import dotenv from 'dotenv';

dotenv.config({path: '../../.env'});
import {CreateNewTicketsEmbed} from '../embed/EmbedNewTickets.js';
import {createButtonAcceptTickets} from '../buttons/AcceptTicketsButton.js';
import {createPrisTicketEmbed} from '../embed/EmbedPrisTickets.js';
import {createButtonsClosedTickets} from '../buttons/ClosedTicketsButtons.js';
import {CreateClosedTicketsEmbed} from '../embed/EmbedClosedTickets.js';

let sendedChannel = undefined;

/**
 * Definition for the /help command
 *
 * @param interaction The interaction object of the command
 * @param client The client object of the bot
 */
async function helpCommand(interaction, client) {
  await interaction.deferReply({ephemeral: true});
  sendedChannel = interaction.channel;
  await client.channels.cache.get(process.env.LOG_CHANNEL_ID).send(
      {
        embeds: [CreateNewTicketsEmbed(interaction.channel.name)],
        components: [createButtonAcceptTickets()],
      });

  await interaction.editReply("Tickets envoyes !")
}

/**
 * Handle the buttons of the help command
 *
 * @param client The client object of the bot
 * @param interaction The interaction object of the button from the help embed messages
 * @returns {Promise<void>} A promise to send to the user
 */
async function handleBoutonHelp(client, interaction) {
    if (interaction.customId === 'take') {
      await interaction.update(
          {
            embeds: [
              createPrisTicketEmbed(interaction.channel.name,
                  interaction.user)],
            components: [createButtonsClosedTickets()],
          });
      sendedChannel.send("Ticket pris par <@" + interaction.user.id + ">")
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
