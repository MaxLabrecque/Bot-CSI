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
  {
    name: "register-team",
    description: "Créer une équipe : rôle + channel privé (moderator only)",
    options: [
      {
        name: "name",
        description: "Nom de l'équipe",
        type: 3,
        required: true,
        max_length: 100,
      },
      {
        name: "members",
        description: "Membres à mentionner : @joueur1 @joueur2 ...",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "add-member",
    description: "Ajouter un membre à une équipe (moderator only)",
    options: [
      {
        name: "team",
        description: "Channel de l'équipe",
        type: 7,
        channel_types: [0],
        required: true,
      },
      {
        name: "member",
        description: "Membre à ajouter",
        type: 6,
        required: true,
      },
    ],
  },
  {
    name: "remove-team",
    description: "Supprimer une équipe : channel + rôle (moderator only)",
    options: [
      {
        name: "team",
        description: "Channel de l'équipe",
        type: 7,
        channel_types: [0],
        required: true,
      },
    ],
  },
  {
    name: "prune-teams",
    description: "Supprimer tous les channels et rôles d'équipe sauf test (moderator only)",
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
