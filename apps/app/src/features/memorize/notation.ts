// First-letter notation — the smooth gradient between full text and title-only.
// Each space-separated token is reduced to its leading alphanumeric character,
// preserving original capitalization, leading and trailing punctuation, and
// hyphens (each hyphen-segment contributes one letter). Apostrophes inside a
// word are dropped (the leading letter alone is the cue).

const ALPHANUMERIC = /[\p{L}\p{N}]/u

function reduceToken(token: string): string {
  let i = 0
  while (i < token.length && !ALPHANUMERIC.test(token[i])) i++
  const leading = token.slice(0, i)

  let j = token.length
  while (j > i && !ALPHANUMERIC.test(token[j - 1])) j--
  const trailing = token.slice(j)

  const wordPart = token.slice(i, j)
  if (!wordPart) return leading

  const reduced = wordPart
    .split('-')
    .map((segment) => segment.match(ALPHANUMERIC)?.[0] ?? '')
    .join('-')

  return leading + reduced + trailing
}

export function toFirstLetter(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .split(/\s+/)
        .filter((t) => t.length > 0)
        .map(reduceToken)
        .join(' '),
    )
    .join('\n')
}
