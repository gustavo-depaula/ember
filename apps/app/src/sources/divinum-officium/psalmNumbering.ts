// DO takes part of a psalm ('39(2-9)') by the verse number each line opens
// with, in each language's own file. The Latin numbers by the Vulgate verse,
// several lines to a verse; 68 of the Portuguese psalms number their lines 1,
// 2, 3… instead, so the same range cuts them elsewhere: a part loses its
// opening verse, the psalm its last, and the two columns no longer hold the
// same lines. Those files translate the Latin line for line, so each line takes
// the number of the Latin line in its place.

const versePrefix = /^\d+:\d+[a-z]?(?=\s)/

export function alignPsalmNumbering(lines: string[], latin: string[]): string[] {
  const numbered = (file: string[]) => file.filter((line) => line.trim() !== '')
  const own = numbered(lines)
  const theirs = numbered(latin)
  // A file with a line more or less, or a title line, is not line for line.
  if (own.length !== theirs.length) return lines
  if (![...own, ...theirs].every((line) => versePrefix.test(line))) return lines
  let n = 0
  return lines.map((line) =>
    line.trim() === '' ? line : line.replace(versePrefix, versePrefix.exec(theirs[n++])?.[0] ?? ''),
  )
}

// The Latin file a vernacular psalm is numbered by; undefined for the Latin
// itself and for every other file.
export function latinPsalmPath(path: string): string | undefined {
  const m = /^horas\/([^/]+)\/(Psalterium\/Psalmorum\/[^/]+)$/.exec(path)
  return m && m[1] !== 'Latin' ? `horas/Latin/${m[2]}` : undefined
}
