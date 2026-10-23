import { ActionRowBuilder, ButtonBuilder } from "discord.js";

/**
 * Create the buttons to confirm or cancel a destructive action
 *
 * @param {string} prefix The prefix of the custom ids ("<prefix>-confirm:<id>")
 * @param {string} id The id of the pending action
 * @returns {ActionRowBuilder<ButtonBuilder>} The buttons
 */
function createConfirmButtons(prefix, id) {
  const confirm = new ButtonBuilder()
    .setCustomId(`${prefix}-confirm:${id}`)
    .setLabel("Confirmer")
    .setStyle("Danger");

  const cancel = new ButtonBuilder()
    .setCustomId(`${prefix}-cancel:${id}`)
    .setLabel("Annuler")
    .setStyle("Secondary");

  return new ActionRowBuilder().addComponents(confirm, cancel);
}

export { createConfirmButtons };
