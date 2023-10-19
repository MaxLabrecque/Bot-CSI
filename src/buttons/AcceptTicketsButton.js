import {ActionRowBuilder, ButtonBuilder} from 'discord.js';

/**
 * Create the button to accept tickets
 *
 * @returns {ActionRowBuilder<ButtonBuilder>} The button to accept tickets
 */
function createButtonAcceptTickets() {
  const confirm = new ButtonBuilder()
    .setCustomId('take')
    .setLabel('Prendre tickets')
    .setStyle('Primary');

 return new ActionRowBuilder().addComponents(confirm);
}

export {createButtonAcceptTickets}
