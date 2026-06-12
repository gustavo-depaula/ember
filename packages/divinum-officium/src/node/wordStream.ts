// Shared normalizers for the differential tests: both the Perl HTML and our
// renderer output reduce to comparable word streams (rendering is ours; the
// assembled CONTENT and its order must match the upstream engine).

// Extract the inner texts of all <TD> cells, tags stripped, <BR> as newlines.
export function htmlCells(html: string): string[] {
  return [...html.matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)].map((m) => {
    let text = m[1]
    text = text.replace(/<BR\s*\/?>/gi, '\n')
    text = text.replace(/<[^>]+>/g, ' ')
    text = text.replace(/&nbsp;|&ensp;|&emsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    return text
  })
}

// Normalize either side to a comparable word stream: lowercase, 1960 i/j
// folding both ways, accents kept, punctuation and markers dropped.
export function toWords(text: string): string[] {
  const stripped = text
    .split('\n')
    // Versicle/dialog markers render as glyphs or red initials in the HTML;
    // drop them on both sides.
    .map((l) => l.replace(/^\s*!?\s*(?:[VRSMAOCDP]|v|r|Ant|Ps)\.\s*/, ''))
    .join('\n')
  const words = stripped
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/[jv]/g, (c) => (c === 'j' ? 'i' : 'u'))
    .replace(/[^a-z0-9áéíóúýǽàèìòùâêîôûäëïöüãõ ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  // The Perl renders 'v. Cognóvi' as a split red initial ('C' 'ognóvi');
  // merge any single letter into the following word — applied identically to
  // both streams so genuine one-letter Latin words stay comparable.
  const merged: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (/^[a-záéíóúýǽ]$/.test(words[i]) && i + 1 < words.length) {
      merged.push(words[i] + words[i + 1])
      i++
    } else {
      merged.push(words[i])
    }
  }
  return merged
}

export function firstDivergence(a: string[], b: string[]): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i
  }
  return a.length === b.length ? -1 : n
}

// Character-stream comparison: joins the word stream without separators so
// the Perl renderer's red-initial splits ('S' 'alve') can't desynchronize the
// single-letter merge. Returns -1 on match, else the index of the first
// divergent character in the joined stream.
export function charDivergence(a: string[], b: string[]): number {
  const sa = a.join('')
  const sb = b.join('')
  const n = Math.min(sa.length, sb.length)
  for (let i = 0; i < n; i++) {
    if (sa[i] !== sb[i]) return i
  }
  return sa.length === sb.length ? -1 : n
}

export function charContext(words: string[], at: number, span = 60): string {
  const s = words.join('')
  return s.slice(Math.max(0, at - span), at + span)
}
