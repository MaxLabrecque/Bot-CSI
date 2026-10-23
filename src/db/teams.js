import db from "./index.js";

/**
 * Save a new team
 *
 * @param team The team infos
 */
function createTeam({ number, name, channelId, roleId }) {
  db.prepare(
    `INSERT INTO teams (number, name, channel_id, role_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(number, name, channelId, roleId, Date.now());
}

/**
 * Get a team by its channel id
 *
 * @param {string} channelId The team channel id
 * @returns The team, or undefined if not found
 */
function getTeamByChannelId(channelId) {
  return db.prepare("SELECT * FROM teams WHERE channel_id = ?").get(channelId);
}

/**
 * Delete a team by its channel id
 *
 * @param {string} channelId The team channel id
 */
function deleteTeamByChannelId(channelId) {
  db.prepare("DELETE FROM teams WHERE channel_id = ?").run(channelId);
}

/**
 * List all the saved teams
 *
 * @returns The teams
 */
function listTeams() {
  return db.prepare("SELECT * FROM teams").all();
}

export { createTeam, deleteTeamByChannelId, getTeamByChannelId, listTeams };
