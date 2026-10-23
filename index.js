import config from "./src/config.js";
import { handleBoutonHelp, helpCommand } from "./src/commands/HelpCommand.js";
import BotClient from "./src/structures/BotClient.js";
import { ActivityType } from "discord.js";
import { sendBroadcastMessage } from "./src/commands/TeamBroadcastCommand.js";
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
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    await handleBoutonHelp(client, interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "team-broadcast") {
    await sendBroadcastMessage(interaction);
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
