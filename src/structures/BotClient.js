import {Client, GatewayIntentBits } from "discord.js";

/**
 * Definition of the bot client
 *
 */
class BotClient extends Client {

  /**
   * Constructor of the bot client. Set the intents of the bot
   */
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  /**
   * Get the invite link of the bot with the permissions for adding to a server
   * @returns {string}
   */
  getInvite() {
    return this.generateInvite({
      scopes: ["bot", "applications.commands"],
      permissions: [
        "ManageChannels",
        "ManageGuild",
        "ManageMessages",
        "ReadMessageHistory",
        "SendMessages",
        "ViewChannel",
      ]
    })
  }
}

export default BotClient;
