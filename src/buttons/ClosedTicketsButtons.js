import {ActionRowBuilder, ButtonBuilder} from 'discord.js';


/**
 * Create the button to close tickets
 *
 * @returns {ActionRowBuilder<ButtonBuilder>} The button to close tickets
 */
function createButtonsClosedTickets() {
  const confirm = new ButtonBuilder()
    .setCustomId('closed')
    .setLabel('Fermer tickets')
    .setStyle('Success');

  return new ActionRowBuilder().addComponents(confirm);
}

export {createButtonsClosedTickets}
