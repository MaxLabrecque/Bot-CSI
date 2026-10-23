import config from "../config.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Matches team channels: <prefix>XX (2 digits) or <prefix><extra>
 * @type {RegExp}
 */
const teamChannelRegex = new RegExp(
  `^${escapeRegex(config.teamChannelPrefix)}(${[
    "\\d{2}",
    ...config.teamChannelExtra.map(escapeRegex),
  ].join("|")})$`,
);

/**
 * Matches only numbered team channels: <prefix>XX (2 digits)
 * @type {RegExp}
 */
const numberedTeamRegex = new RegExp(
  `^${escapeRegex(config.teamChannelPrefix)}(\\d{2})$`,
);

/**
 * Check if a channel name is a team channel
 *
 * @param {string} name The channel name
 * @returns {boolean}
 */
function isTeamChannel(name) {
  return !!name && teamChannelRegex.test(name);
}

/**
 * Human readable description of team channel names, for messages
 *
 * @returns {string} e.g. "equipe-XX ou equipe-test"
 */
function teamChannelLabel() {
  return [`${config.teamChannelPrefix}XX`]
    .concat(config.teamChannelExtra.map((e) => config.teamChannelPrefix + e))
    .join(" ou ");
}

/**
 * Get the number of a numbered team channel or role ("equipe-07" -> 7)
 *
 * @param {string} name The channel or role name
 * @returns {number|null} The number, or null if not a numbered team name
 */
function teamNumber(name) {
  const match = numberedTeamRegex.exec(name ?? "");
  return match ? Number(match[1]) : null;
}

/**
 * Build the channel / role name of a team number (7 -> "equipe-07")
 *
 * @param {number} number The team number
 * @returns {string}
 */
function teamChannelName(number) {
  return config.teamChannelPrefix + String(number).padStart(2, "0");
}

export { isTeamChannel, teamChannelLabel, teamChannelName, teamNumber };
