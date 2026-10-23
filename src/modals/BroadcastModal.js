import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

/**
 * Create the modal to write the broadcast message (multi-line)
 *
 * @param {string} id The id of the pending broadcast
 * @param {number} maxLength Max length of the message (1900 as text, 4000 in an embed)
 * @returns {ModalBuilder} The modal
 */
function createBroadcastModal(id, maxLength) {
  const message = new TextInputBuilder()
    .setCustomId("message")
    .setLabel("Message")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(maxLength)
    .setRequired(true);

  return new ModalBuilder()
    .setCustomId(`broadcast-modal:${id}`)
    .setTitle("Broadcast aux équipes")
    .addComponents(new ActionRowBuilder().addComponents(message));
}

export { createBroadcastModal };
