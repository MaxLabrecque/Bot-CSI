import {EmbedBuilder} from 'discord.js';

/**
 * Create the embed for the closed tickets
 *
 * @param channelName The name of the channel that the message has been sent
 * @param taker The user that took the ticket
 * @returns {EmbedBuilder} The embed for the closed tickets
 * @constructor The embed for the closed tickets
 */
function CreateClosedTicketsEmbed(channelName, taker) {
  return new EmbedBuilder()
  .setTitle('Ticket fermé')
  .setDescription(`Ticket **${channelName}** est fermé !`)
  .setAuthor({name: taker.globalName,iconURL: taker.avatarURL()})
      .setColor('#e33b50')
}

export {CreateClosedTicketsEmbed};

