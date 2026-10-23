import { EmbedBuilder } from "discord.js";
import { formatDuration } from "../utils/time.js";

const truncate = (str, max) => (str.length > max ? str.slice(0, max - 1) + "…" : str);

const TITLES = {
  overview: "Statistiques — Vue d'ensemble",
  teams: "Statistiques — Tickets par équipe",
  challenges: "Statistiques — Tickets par challenge",
  admins: "Statistiques — Tickets pris par admin",
};

/**
 * Build the lines of a stats view
 *
 * @param {string} view The view (overview, teams, challenges, admins)
 * @param data The stats from the database
 * @returns {string[]}
 */
function buildLines(view, data) {
  switch (view) {
    case "overview":
      return [
        `**Total :** ${data.total}`,
        `🟢 Ouverts : ${data.open}`,
        `🟡 Pris : ${data.taken}`,
        `🔴 Fermés : ${data.closed}`,
        "",
        `⏱️ Temps moyen avant prise : **${formatDuration(data.avg_take_ms)}**`,
        `✅ Temps moyen avant fermeture : **${formatDuration(data.avg_close_ms)}**`,
      ];
    case "teams":
      return data.map((r, i) => `${i + 1}. **${r.team}** — ${r.count} ticket(s)`);
    case "challenges":
      return data.map(
        (r, i) => `${i + 1}. **${truncate(r.challenge, 50)}** — ${r.count} ticket(s), ${r.teams} équipe(s)`,
      );
    case "admins":
      return data.map(
        (r, i) =>
          `${i + 1}. <@${r.admin}> — ${r.count} ticket(s), prise moyenne ${formatDuration(r.avg_take_ms)}`,
      );
    default:
      return [];
  }
}

/**
 * Create the embed of the /stats command
 *
 * @param {string} view The view (overview, teams, challenges, admins)
 * @param data The stats from the database
 * @param {string} periodLabel e.g. "depuis toujours", "dernières 24h"
 * @returns {EmbedBuilder} The embed of the stats
 */
function createStatsEmbed(view, data, periodLabel) {
  const lines = buildLines(view, data);
  return new EmbedBuilder()
    .setTitle(TITLES[view])
    .setDescription(lines.length ? lines.join("\n") : "Aucun ticket sur cette période.")
    .setFooter({ text: `Période : ${periodLabel}` })
    .setColor("#5865f2")
    .setTimestamp();
}

export { createStatsEmbed };
