import {ActionRowBuilder, ButtonBuilder} from 'discord.js';


function createButtonsClosedTickets() {
  const confirm = new ButtonBuilder()
    .setCustomId('closed')
    .setLabel('Fermer tickets')
    .setStyle('Success');

  return new ActionRowBuilder().addComponents(confirm);
}
export {createButtonsClosedTickets}
