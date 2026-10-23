import { EmbedBuilder } from "discord.js";
import config from "../config.js";
import { joinLinesWithin } from "../utils/text.js";

/**
 * Format a ticket in one line: id, team, challenge, age, taker, link
 *
 * @param ticket The ticket from the database
 * @param {string} guildId The guild of the log channel (for the link)
 * @returns {string}
 */
function formatTicketLine(ticket, guildId) {
  const link = `https://discord.com/channels/${guildId}/${config.logChannelId}/${ticket.log_message_id}`;
  const age = `<t:${Math.floor(ticket.created_at / 1000)}:R>`;
  const taker = ticket.taken_by ? ` — pris par <@${ticket.taken_by}>` : "";
  return `\`#${ticket.id}\` **${ticket.channel_name}** — ${ticket.challenge} — ${age}${taker} — [voir](${link})`;
}

/**
 * Create the embed of the /tickets dashboard
 *
 * @param tickets The open and taken tickets
 * @param {string} guildId The guild of the log channel
 * @returns {EmbedBuilder} The embed of the dashboard
 */
function createTicketsDashboardEmbed(tickets, guildId) {
  const open = tickets.filter((t) => t.status === "open");
  const taken = tickets.filter((t) => t.status === "taken");

  const lines = [];
  if (open.length) {
    lines.push(`**🟢 Ouverts (${open.length})**`);
    lines.push(...open.map((t) => formatTicketLine(t, guildId)));
  }
  if (taken.length) {
    if (lines.length) lines.push("");
    lines.push(`**🟡 Pris (${taken.length})**`);
    lines.push(...taken.map((t) => formatTicketLine(t, guildId)));
  }

  return new EmbedBuilder()
    .setTitle("Tickets en cours")
    .setDescription(joinLinesWithin(lines, 4000))
    .setColor("#5865f2")
    .setTimestamp();
}

export { createTicketsDashboardEmbed, formatTicketLine };
