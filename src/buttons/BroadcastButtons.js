import { ActionRowBuilder, ButtonBuilder } from "discord.js";

/**
 * Create the buttons to confirm or cancel a broadcast
 *
 * @param {string} id The id of the pending broadcast
 * @returns {ActionRowBuilder<ButtonBuilder>} The buttons
 */
function createBroadcastButtons(id) {
  const send = new ButtonBuilder()
    .setCustomId(`broadcast-send:${id}`)
    .setLabel("Envoyer")
    .setStyle("Success");

  const cancel = new ButtonBuilder()
    .setCustomId(`broadcast-cancel:${id}`)
    .setLabel("Annuler")
    .setStyle("Secondary");

  return new ActionRowBuilder().addComponents(send, cancel);
}

export { createBroadcastButtons };
