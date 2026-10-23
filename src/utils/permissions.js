import config from "../config.js";

/**
 * Find the moderator role of a guild (case-insensitive)
 *
 * @param guild The guild
 * @returns The role, or undefined if not found
 */
function findModRole(guild) {
  const name = config.moderatorRole.toLowerCase();
  return guild.roles.cache.find((r) => r.name.toLowerCase() === name);
}

/**
 * Check if a member has the moderator role
 *
 * @param member The guild member
 * @returns {boolean}
 */
function hasModRole(member) {
  const role = findModRole(member.guild);
  return !!role && member.roles.cache.has(role.id);
}

export { findModRole, hasModRole };
