import {Client, GatewayIntentBits } from "discord.js";

class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

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
