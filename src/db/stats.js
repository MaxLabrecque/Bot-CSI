import db from "./index.js";

const TOP_LIMIT = 15;

/**
 * Global numbers of the tickets created since a date
 *
 * @param {number} since Timestamp (ms), 0 = all time
 */
function getOverviewStats(since) {
  return db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(status = 'open'), 0) AS open,
         COALESCE(SUM(status = 'taken'), 0) AS taken,
         COALESCE(SUM(status = 'closed'), 0) AS closed,
         AVG(taken_at - created_at) AS avg_take_ms,
         AVG(closed_at - created_at) AS avg_close_ms
       FROM tickets WHERE created_at >= ?`,
    )
    .get(since);
}

/**
 * Number of tickets per team, most tickets first
 *
 * @param {number} since Timestamp (ms), 0 = all time
 */
function getTeamStats(since) {
  return db
    .prepare(
      `SELECT channel_name AS team, COUNT(*) AS count
       FROM tickets WHERE created_at >= ?
       GROUP BY channel_name ORDER BY count DESC, team LIMIT ?`,
    )
    .all(since, TOP_LIMIT);
}

/**
 * Number of tickets per challenge (name trimmed + lowercase so "Web1" and
 * "web1 " are grouped), with the number of different teams asking
 *
 * @param {number} since Timestamp (ms), 0 = all time
 */
function getChallengeStats(since) {
  return db
    .prepare(
      `SELECT LOWER(TRIM(challenge)) AS challenge, COUNT(*) AS count,
         COUNT(DISTINCT channel_name) AS teams
       FROM tickets WHERE created_at >= ?
       GROUP BY LOWER(TRIM(challenge)) ORDER BY count DESC, challenge LIMIT ?`,
    )
    .all(since, TOP_LIMIT);
}

/**
 * Number of tickets taken per admin, with their average time to take
 *
 * @param {number} since Timestamp (ms), 0 = all time
 */
function getAdminStats(since) {
  return db
    .prepare(
      `SELECT taken_by AS admin, COUNT(*) AS count,
         AVG(taken_at - created_at) AS avg_take_ms
       FROM tickets WHERE created_at >= ? AND taken_by IS NOT NULL
       GROUP BY taken_by ORDER BY count DESC LIMIT ?`,
    )
    .all(since, TOP_LIMIT);
}

export { getAdminStats, getChallengeStats, getOverviewStats, getTeamStats };
