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

export { isTeamChannel, teamChannelLabel };
