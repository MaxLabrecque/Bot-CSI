import {ActionRowBuilder, ButtonBuilder} from 'discord.js';

function createButtonsAcceptTickets() {
  const confirm = new ButtonBuilder()
    .setCustomId('take')
    .setLabel('Prendre tickets')
    .setStyle('Primary');

 return new ActionRowBuilder().addComponents(confirm);
}

export {createButtonsAcceptTickets}
