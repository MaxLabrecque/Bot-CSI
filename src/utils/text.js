/**
 * Join lines with "\n" without going over a max length.
 * The lines that don't fit are replaced by "… et N autre(s)".
 *
 * @param {string[]} lines The lines
 * @param {number} max The max length of the result
 * @returns {string}
 */
function joinLinesWithin(lines, max) {
  const kept = [];
  let length = 0;
  for (const [index, line] of lines.entries()) {
    const rest = lines.length - index;
    const suffix = `\n… et ${rest} autre(s)`;
    if (length + line.length + 1 + suffix.length > max) {
      return kept.join("\n") + suffix;
    }
    kept.push(line);
    length += line.length + 1;
  }
  return kept.join("\n");
}

export { joinLinesWithin };
