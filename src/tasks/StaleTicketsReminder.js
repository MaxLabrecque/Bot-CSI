import config from "../config.js";
import { listStaleTickets, markTicketsReminded } from "../db/tickets.js";
import { formatTicketLine } from "../embed/EmbedTicketsDashboard.js";
import { findAdminRole } from "../utils/permissions.js";
import { joinLinesWithin } from "../utils/text.js";

const CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Ping the admins in the log channel for the tickets still open after
 * TICKET_STALE_MINUTES. Each ticket is reminded only once.
 *
 * @param client The client object of the bot
 */
async function remindStaleTickets(client) {
  const tickets = listStaleTickets(
    Date.now() - config.ticketStaleMinutes * 60 * 1000,
  );
  if (!tickets.length) return;

  const logChannel = await client.channels.fetch(config.logChannelId);
  const role = findAdminRole(logChannel.guild);
  const header =
    (role ? `<@&${role.id}> ` : "") +
    `${tickets.length} ticket(s) en attente depuis plus de ${config.ticketStaleMinutes} min :`;
  const lines = tickets.map((t) => formatTicketLine(t, logChannel.guildId));

  await logChannel.send({
    content: `${header}\n${joinLinesWithin(lines, 2000 - header.length - 1)}`,
    allowedMentions: { roles: role ? [role.id] : [] },
  });
  markTicketsReminded(tickets.map((t) => t.id));
}

/**
 * Start checking the stale tickets every minute
 *
 * @param client The client object of the bot
 */
function startStaleTicketsReminder(client) {
  setInterval(() => {
    remindStaleTickets(client).catch((error) =>
      console.error("Stale tickets reminder failed", error),
    );
  }, CHECK_INTERVAL_MS);
}

export { remindStaleTickets, startStaleTicketsReminder };
