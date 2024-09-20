import { EmbedBuilder } from "discord.js";

/**
 * Create the embed for the new tickets
 *
 * @param channelName The name of the channel that the message has been sent
 * @returns {EmbedBuilder} The embed for the new tickets
 * @constructor The embed for the new tickets
 */
function CreateNewTicketsEmbed(channelName, userMessage, challengeNameInput) {
  return new EmbedBuilder()
    .setTitle("Ticket")
    .setDescription(
      `Un ticket a été ouvert dans le channel **${channelName}** ! Challenge : **${challengeNameInput}**`,
    )
    .setColor("#3aa55c");
}

export { CreateNewTicketsEmbed };
