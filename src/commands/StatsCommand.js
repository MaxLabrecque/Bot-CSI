import config from "../config.js";
import {
  getAdminStats,
  getChallengeStats,
  getOverviewStats,
  getTeamStats,
} from "../db/stats.js";
import { createStatsEmbed } from "../embed/EmbedStats.js";
import { isStaff } from "../utils/permissions.js";
import { parseDuration } from "../utils/time.js";

const QUERIES = {
  overview: getOverviewStats,
  teams: getTeamStats,
  challenges: getChallengeStats,
  admins: getAdminStats,
};

/**
 * Definition for the /stats command: statistics on the tickets
 *
 * @param interaction The interaction object of the command
 */
async function statsCommand(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
  }

  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: `Vous devez avoir le rôle '${config.moderatorRole}' pour utiliser cette commande.`,
      ephemeral: true,
    });
  }

  const view = interaction.options.getString("view") ?? "all";
  const views = view === "all" ? Object.keys(QUERIES) : [view];
  const sinceInput = interaction.options.getString("since");

  let since = 0;
  let periodLabel = "depuis toujours";
  if (sinceInput) {
    const duration = parseDuration(sinceInput);
    if (!duration) {
      return interaction.reply({
        content: "Période invalide. Exemples : `30m`, `24h`, `7j`.",
        ephemeral: true,
      });
    }
    since = Date.now() - duration;
    periodLabel = `dernières ${sinceInput.trim()}`;
  }

  await interaction.reply({
    embeds: views.map((v) => createStatsEmbed(v, QUERIES[v](since), periodLabel)),
  });
}

export { statsCommand };
