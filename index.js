import config from "./src/config.js";
import { handleBoutonHelp, helpCommand } from "./src/commands/HelpCommand.js";
import BotClient from "./src/structures/BotClient.js";
import { ActivityType } from "discord.js";
import {
  handleBroadcastButton,
  handleBroadcastModal,
  sendBroadcastMessage,
} from "./src/commands/TeamBroadcastCommand.js";
import { ticketsCommand } from "./src/commands/TicketsCommand.js";
import { statsCommand } from "./src/commands/StatsCommand.js";
import {
  addMemberCommand,
  handleTeamsButton,
  pruneTeamsCommand,
  registerTeamCommand,
  removeTeamCommand,
} from "./src/commands/TeamsCommand.js";
import { startStaleTicketsReminder } from "./src/tasks/StaleTicketsReminder.js";
import { isTeamChannel } from "./src/utils/teams.js";

const avatarPath = "assets/logo.webp";

const client = new BotClient();
client.on("ready", () => {
  console.log("Discord bot is on !");
  console.log("There is an invite Link : " + client.getInvite());
  // client.user.setUsername("CSI Bot")
  client.user.setActivity({
    name: "Doing Some CTFs",
    type: ActivityType.Custom,
  });

  // client.user.setAvatar(avatarPath);

  startStaleTicketsReminder(client);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("broadcast-")) {
      await handleBroadcastButton(client, interaction);
    } else if (interaction.customId.startsWith("teams-")) {
      await handleTeamsButton(client, interaction);
    } else {
      await handleBoutonHelp(client, interaction);
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("broadcast-modal:")) {
      await handleBroadcastModal(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "team-broadcast") {
    await sendBroadcastMessage(interaction);
    return;
  }

  if (interaction.commandName === "tickets") {
    await ticketsCommand(interaction);
    return;
  }

  if (interaction.commandName === "stats") {
    await statsCommand(interaction);
    return;
  }

  if (interaction.commandName === "register-team") {
    await registerTeamCommand(interaction, client);
    return;
  }

  if (interaction.commandName === "add-member") {
    await addMemberCommand(interaction);
    return;
  }

  if (interaction.commandName === "remove-team") {
    await removeTeamCommand(interaction);
    return;
  }

  if (interaction.commandName === "prune-teams") {
    await pruneTeamsCommand(interaction);
    return;
  }

  if (!isTeamChannel(interaction.channel?.name)) {
    await interaction.reply({
      content: "Veuillez utiliser cette commande dans un channel d'équipe",
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName === "help") {
    await helpCommand(interaction, client);
  }
});

client.login(config.botToken);
