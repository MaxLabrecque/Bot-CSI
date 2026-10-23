import config from "../config.js";

/**
 * Normalize a role name: lowercase, "_" and "-" treated as spaces
 *
 * @param {string} name The role name
 * @returns {string}
 */
const normalizeRoleName = (name) =>
  name.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * Find a role of a guild by name (case-insensitive, "_" / "-" / " " equivalent)
 *
 * @param guild The guild
 * @param {string} roleName The role name
 * @returns The role, or undefined if not found
 */
function findRoleByName(guild, roleName) {
  const name = normalizeRoleName(roleName);
  return guild.roles.cache.find((r) => normalizeRoleName(r.name) === name);
}

/**
 * Find the moderator role of a guild (case-insensitive)
 *
 * @param guild The guild
 * @returns The role, or undefined if not found
 */
function findModRole(guild) {
  return findRoleByName(guild, config.moderatorRole);
}

/**
 * Find the admin role of a guild (the one pinged for tickets)
 *
 * @param guild The guild
 * @returns The role, or undefined if not found
 */
function findAdminRole(guild) {
  return findRoleByName(guild, config.adminRole);
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

/**
 * Check if a member is staff (moderator or admin role)
 *
 * @param member The guild member
 * @returns {boolean}
 */
function isStaff(member) {
  const role = findAdminRole(member.guild);
  return hasModRole(member) || (!!role && member.roles.cache.has(role.id));
}

export { findAdminRole, findModRole, hasModRole, isStaff };
