import "dotenv/config";

const required = ["BOT_TOKEN", "CLIENT_ID", "LOG_CHANNEL_ID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env variable(s): ${missing.join(", ")}`);
  process.exit(1);
}

/**
 * Bot configuration read from the environment (.env)
 */
const config = {
  botToken: process.env.BOT_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  logChannelId: process.env.LOG_CHANNEL_ID,
  teamChannelPrefix: process.env.TEAM_CHANNEL_PREFIX || "equipe-",
  teamChannelExtra: (process.env.TEAM_CHANNEL_EXTRA ?? "test")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
  moderatorRole: process.env.MODERATOR_ROLE || "moderator",
  adminRole:
    process.env.ADMIN_ROLE || process.env.MODERATOR_ROLE || "moderator",
  ticketStaleMinutes: Number(process.env.TICKET_STALE_MINUTES) || 5,
  dbPath: process.env.DB_PATH || "db/bot.sqlite",
};

export default config;
