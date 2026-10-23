import { REST, Routes } from "discord.js";
import config from "./config.js";

/**
 * Create the REST object
 * @type {REST}
 */
const rest = new REST({ version: "10" }).setToken(config.botToken);

// List of the commands
const commands = [
  {
    name: "help",
    description: "Help for the ctf team",
    options: [
      {
        name: "challenge",
        description: "Name of the challenge",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "team-broadcast",
    description: "Broadcast a message to all teams",
    options: [
      {
        name: "message",
        description: "The message to broadcast",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "tickets",
    description: "Liste des tickets en cours (moderator only)",
    options: [
      {
        name: "status",
        description: "Filtrer par statut",
        type: 3,
        choices: [
          { name: "Tous (ouverts + pris)", value: "all" },
          { name: "Ouverts", value: "open" },
          { name: "Pris", value: "taken" },
        ],
      },
    ],
  },
];

/**
 * Register the slash commands to the Discord API
 */
try {
  console.log("Started refreshing application (/) commands.");
  // Guild commands update instantly (dev), global ones can take a while
  const route = config.guildId
    ? Routes.applicationGuildCommands(config.clientId, config.guildId)
    : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body: commands });

  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}
