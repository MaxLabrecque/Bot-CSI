import {EmbedBuilder} from 'discord.js';

function CreateClosedTicketsEmbed(channelName, taker) {
  return new EmbedBuilder()
  .setTitle('Ticket fermé')
  .setDescription(`Ticket **${channelName}** est fermé !`)
  .setAuthor({name: taker.globalName,iconURL: taker.avatarURL()})
      .setColor('#e33b50')
}

export {CreateClosedTicketsEmbed};

