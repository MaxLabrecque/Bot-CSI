import dotenv from 'dotenv'
dotenv.config({path: '../.env'})
import {REST, Routes} from 'discord.js';

/**
 * Create the REST object
 * @type {REST}
 */
const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);

// List of the commands
const commands = [
  {
    name: 'help',
    description: 'Help for the ctf team',
  }
]
/**
 * Register the slash commands to the Discord API
 */
try {
  console.log("Started refreshing application (/) commands.");

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: commands});

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

