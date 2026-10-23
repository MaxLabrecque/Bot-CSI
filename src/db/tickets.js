import db from "./index.js";

/**
 * Save a new ticket
 *
 * @param ticket The ticket infos
 */
function createTicket({ logMessageId, channelId, channelName, userId, userName, challenge }) {
  db.prepare(
    `INSERT INTO tickets (log_message_id, channel_id, channel_name, user_id, user_name, challenge, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(logMessageId, channelId, channelName, userId, userName, challenge, Date.now());
}

/**
 * Get a ticket by the id of its message in the log channel
 *
 * @param {string} logMessageId The message id
 * @returns The ticket, or undefined if not found
 */
function getTicketByMessageId(logMessageId) {
  return db
    .prepare("SELECT * FROM tickets WHERE log_message_id = ?")
    .get(logMessageId);
}

/**
 * Mark a ticket as taken, only if it is still open
 *
 * @param {string} logMessageId The message id
 * @param {string} userId The admin taking the ticket
 * @returns {boolean} false if the ticket was already taken or closed
 */
function takeTicket(logMessageId, userId) {
  const result = db
    .prepare(
      `UPDATE tickets SET status = 'taken', taken_by = ?, taken_at = ?
       WHERE log_message_id = ? AND status = 'open'`,
    )
    .run(userId, Date.now(), logMessageId);
  return result.changes === 1;
}

/**
 * Mark a ticket as closed, only if it is not already closed
 *
 * @param {string} logMessageId The message id
 * @param {string} userId The admin closing the ticket
 * @returns {boolean} false if the ticket was already closed
 */
function closeTicket(logMessageId, userId) {
  const result = db
    .prepare(
      `UPDATE tickets SET status = 'closed', closed_by = ?, closed_at = ?
       WHERE log_message_id = ? AND status != 'closed'`,
    )
    .run(userId, Date.now(), logMessageId);
  return result.changes === 1;
}

export { createTicket, getTicketByMessageId, takeTicket, closeTicket };
