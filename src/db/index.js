import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import config from "../config.js";

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

/**
 * SQLite database of the bot
 * @type {DatabaseSync}
 */
const db = new DatabaseSync(config.dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_message_id TEXT NOT NULL UNIQUE,
    channel_id TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    challenge TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at INTEGER NOT NULL,
    taken_by TEXT,
    taken_at INTEGER,
    closed_by TEXT,
    closed_at INTEGER
  );
`);

/**
 * Add a column to an existing table if it is missing (simple migration)
 *
 * @param {string} table The table name
 * @param {string} column The column name
 * @param {string} definition The SQL type of the column
 */
function addColumnIfMissing(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

addColumnIfMissing("tickets", "reminded_at", "INTEGER");

export default db;
