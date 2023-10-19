import {EmbedBuilder} from 'discord.js';

function CreateNewTicketsEmbed(channelName) {

  return new EmbedBuilder()
    .setTitle('Ticket')
    .setDescription(`Un ticket a été ouvert dans le channel **${channelName}**`)
      .setColor('#3aa55c')
}

export {CreateNewTicketsEmbed};
