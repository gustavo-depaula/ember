// Reading a GABC file: the `key: value;` headers GregoBase's record became, and
// the score beneath the `%%` line. GABC is Gregorio's notation, and a score in
// the corpus is kept as its transcriber wrote it for Gregorio's TeX — so it
// carries marks that mean something only to TeX, which have to come out before
// another engraver sees them.

export type GabcFile = {
  headers: Record<string, string>
  score: string
}

export function parseGabc(text: string): GabcFile {
  const split = text.indexOf('\n%%')
  if (split < 0) return { headers: {}, score: text }
  const headers: Record<string, string> = {}
  for (const line of text.slice(0, split).split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    headers[line.slice(0, colon).trim()] = line
      .slice(colon + 1)
      .trim()
      .replace(/;$/, '')
      .trim()
  }
  return { headers, score: text.slice(text.indexOf('\n', split + 1) + 1) }
}

// A parenthesised group is notes; everything outside is lyric text. The split
// keeps the groups, so odd indices are notes and even ones text.
const noteGroups = /(\([^)]*\))/

/**
 * The score as the layout engine should read it: Gregorio-TeX's own devices
 * resolved or dropped, the notation itself untouched.
 */
export function engravableScore(score: string): string {
  return score
    .split(noteGroups)
    .map((part, i) => (i % 2 ? engravableNotes(part) : engravableText(part)))
    .join('')
}

function engravableText(text: string): string {
  return (
    text
      // `<clear>` asks TeX to keep a syllable clear of the notes after it, and
      // `<nlba>` forbids a line break inside it. Layout hints for one page width.
      .replace(/<\/?(clear|nlba|eu)>/g, '')
      // The asterisk raised to the staff, in verbatim TeX.
      .replace(/<v>\\greheightstar<\/v>/g, '*')
      // Any other verbatim TeX command is spacing (`\kern 6mm`, `\hspace`).
      .replace(/<v>\\[a-zA-Z]+[^<]*<\/v>/g, '')
      // TeX's non-breaking space, used to nudge a syllable along the staff.
      .replace(/~/g, ' ')
  )
}

function engravableNotes(group: string): string {
  // `z`/`Z` force a line break where the printed page had one. The score is
  // set to the reader's own width here, so the break falls where it falls.
  if (/^\([zZ][-+0]?\)$/.test(group)) return ''
  return group
}
