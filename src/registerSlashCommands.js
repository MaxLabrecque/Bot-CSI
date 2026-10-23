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
    description: "Envoyer un message aux équipes (moderator only)",
    options: [
      {
        name: "team",
        description: "Une seule équipe (défaut : toutes)",
        type: 7,
        channel_types: [0],
      },
      {
        name: "title",
        description: "Titre (le message est envoyé en embed)",
        type: 3,
        max_length: 256,
      },
      {
        name: "attachment",
        description: "Fichier joint",
        type: 11,
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
  {
    name: "stats",
    description: "Statistiques des tickets (moderator only)",
    options: [
      {
        name: "view",
        description: "Vue à afficher (défaut : tout)",
        type: 3,
        choices: [
          { name: "Tout", value: "all" },
          { name: "Vue d'ensemble", value: "overview" },
          { name: "Par équipe", value: "teams" },
          { name: "Par challenge", value: "challenges" },
          { name: "Par admin", value: "admins" },
        ],
      },
      {
        name: "since",
        description: "Période, ex : 30m, 24h, 7j (défaut : depuis toujours)",
        type: 3,
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
