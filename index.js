import { } from "dotenv/config";
import { handleBoutonHelp, helpCommand } from "./src/commands/HelpCommand.js";
import BotClient from "./src/structures/BotClient.js";
import { ActivityType } from "discord.js";

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

  client.user.setAvatar(avatarPath);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    await handleBoutonHelp(client, interaction);
    return;
  }

  if (
    !interaction.channel.name.match("equipe-[0-1][0-9]")
  ) {
    interaction.reply({
      content: "Please use this command in a team channel",
      ephemeral: true,
    });
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    await helpCommand(interaction, client);
  }
});

client.login(process.env.BOT_TOKEN);
