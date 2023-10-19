import {} from 'dotenv/config'
import {helpCommand, handleBoutonHelp} from './src/commands/HelpCommand.js';
import BotClient from "./src/structures/BotClient.js";
import {ActivityType} from 'discord.js';

const client = new BotClient();
client.on('ready', () => {
  console.log("Discord bot is on !")
  console.log("There is an invite Link : " + client.getInvite())
  // client.user.setUsername("CSI Bot")
  client.user.setActivity({name: 'Doing Some CTFs', type: ActivityType.Custom})
});

client.on('interactionCreate', async interaction => {

  if (interaction.isButton()) {
    await handleBoutonHelp(client, interaction)
    return
  }
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
   await helpCommand(interaction, client);
  }
});

client.login(process.env.BOT_TOKEN);
