
import {EmbedBuilder} from 'discord.js';

function createPrisTicketEmbed(channelName, taker) {
  return new EmbedBuilder()
  .setTitle('Ticket prit')
  .setDescription(`Ticket ouvert dans le channel **${channelName}** est prit par *${taker.globalName}* !`)
    .setAuthor({name: taker.globalName,iconURL: taker.avatarURL()})
      .setColor('#FFFF00')
}

export {createPrisTicketEmbed};

