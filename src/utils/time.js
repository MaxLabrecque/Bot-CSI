const UNITS_MS = {
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  j: 24 * 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parse a duration like "30m", "24h", "7j" or "7d"
 *
 * @param {string} input The duration
 * @returns {number|null} The duration in ms, or null if invalid
 */
function parseDuration(input) {
  const match = /^(\d+)\s*([mhjd])$/i.exec(input.trim());
  if (!match) return null;
  return Number(match[1]) * UNITS_MS[match[2].toLowerCase()];
}

/**
 * Format a duration in a short readable way: "45 s", "4 min 12 s", "1 h 05 min"
 *
 * @param {number|null} ms The duration in ms
 * @returns {string}
 */
function formatDuration(ms) {
  if (ms == null) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ${String(seconds % 60).padStart(2, "0")} s`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${String(minutes % 60).padStart(2, "0")} min`;
}

export { formatDuration, parseDuration };
