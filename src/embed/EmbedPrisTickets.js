
import {EmbedBuilder} from 'discord.js';


/**
 * Create the embed for the taken tickets
 *
 * @param channelName The name of the channel that the message has been sent
 * @param taker The user that took the ticket
 * @returns {EmbedBuilder} The embed for the taken tickets
 * @constructor The embed for the taken tickets
 */
function createPrisTicketEmbed(channelName, taker) {
  return new EmbedBuilder()
  .setTitle('Ticket prit')
  .setDescription(`Ticket ouvert dans le channel **${channelName}** est prit par *${taker.globalName}* !`)
    .setAuthor({name: taker.globalName,iconURL: taker.avatarURL()})
      .setColor('#FFFF00')
}

export {createPrisTicketEmbed};

