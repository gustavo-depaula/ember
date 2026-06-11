/**
 * Universal algorithmic text fixes ported from refine.py (the audited fixes
 * that aren't simple literal patches): OCR/typesetting defects that follow a
 * pattern. Applied to every language string during enrich, before patches.
 */

// 'IEn ce jour-là' → 'En ce jour-là', 'IVoici' → 'Voici': a roman-numeral
// verse marker concatenated onto the next word, at start-of-string or after
// sentence-end punctuation. The negative lookahead protects French century
// ordinals ('IVe siècle') — refine.py documented that intent but its pattern
// didn't enforce it; we do.
const leadingRomanLeakRe =
  /(^|(?<=[.!?»"')’]\s))(?![IVX]{1,4}e\b)([IVX]{1,4})([A-ZÉÈÀÎÔÛÄÖÜÇ][a-zàáâäãéèêëíîïóôöõúûüçñ])/g

export function stripLeadingRomanLeak(text: string): string {
  return text.replace(leadingRomanLeakRe, (_m, pre: string, _roman: string, rest: string) => `${pre}${rest}`)
}

const doubledAlleluiaRe =
  /\b(Allelúia|Alléluia|Alleluia|Aleluia|Aleluya)\s+(Allelúia|Alléluia|Alleluia|Aleluia|Aleluya)\b/g

// 'Aleluya Aleluya. Esta' → 'Aleluya, aleluya. Esta'
export function fixDoubledAlleluia(text: string): string {
  let out = text.replace(doubledAlleluiaRe, (_m, first: string, second: string) => `${first}, ${second.toLowerCase()}`)
  // 'Aleluya, aleluya Veni' (no period after second) → insert one.
  out = out.replace(
    /(Aleluya|Alleluia|Aleluia|Allelúia|Alléluia),\s+(aleluya|alleluia|aleluia|allelúia|alléluia)\s+(?=[A-ZÀ-Ý])/g,
    (_m, first: string, second: string) => `${first}, ${second}. `,
  )
  return out
}

// 'Senhor.. Ou:' → 'Senhor. Ou:' — collapse exactly two periods, never ellipses.
export function fixDoublePeriod(text: string): string {
  return text.replace(/(?<!\.)\s?\.\s*\.(?!\.)/g, '.').replace(/\.\s{2,}/g, '. ')
}

// Title-level fixes: '8.THE MOST' → '8. THE MOST'; 'ChristI' → 'Christi';
// 'BeaTa' / 'beaTa' → 'Beata' / 'beata'.
export function fixTitleTypos(title: string): string {
  let out = title.replace(/^(\d+)\.([A-Z])/, '$1. $2')
  out = out.replace(/\b([A-Z][a-zà-ÿæœ]+)([A-Z])\b/g, (_m, head: string, cap: string) => head + cap.toLowerCase())
  out = out.replace(
    /\b([A-Za-zÀ-ÿæœ][a-zà-ÿæœ]+)([A-Z])([a-zà-ÿæœ]+)\b/g,
    (_m, head: string, cap: string, tail: string) => head + cap.toLowerCase() + tail,
  )
  out = out.replace(/(\d)\.([A-Za-z])/g, '$1. $2')
  return out
}

/** The full universal pipeline for body text (not titles). */
export function applyUniversalFixes(text: string): string {
  return fixDoublePeriod(fixDoubledAlleluia(stripLeadingRomanLeak(text)))
}
