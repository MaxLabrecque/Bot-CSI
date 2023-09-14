import {} from 'dotenv/config'

import BotClient from "./src/structures/BotClient.js";

const client = new BotClient();

client.on('ready', () => {
  console.log("Discord bot is on !")
  console.log("There is an invite Link : " + client.getInvite())
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.login(process.env.BOT_TOKEN);
