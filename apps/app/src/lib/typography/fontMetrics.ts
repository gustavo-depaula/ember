import type { ReadingFontId } from '@/config/readingFonts'
import { fontMetrics } from './fontMetrics.generated'

// Standard Latin f-ligatures. A font renders `ffl` as ONE narrower glyph, so
// summing the individual advances overstates the word — by 2.5px on "afflict"
// in EB Garamond at 22px, which is enough to overflow a line and cascade a
// re-wrap through the rest of the paragraph. Longest first so `ffl` wins
// over `ff`.
const ligatures: readonly (readonly [string, string])[] = [
  ['ffl', 'ﬄ'],
  ['ffi', 'ﬃ'],
  ['ff', 'ﬀ'],
  ['fi', 'ﬁ'],
  ['fl', 'ﬂ'],
]

export type FontMetrics = {
  /** Advance of `text` at `fontSizePx`, ligatures accounted for. */
  width: (text: string, fontSizePx: number) => number
  /** Advance of a single character — justif uses it for protrusion credit. */
  charAdvance: (ch: string, fontSizePx: number) => number
}

const cache = new Map<ReadingFontId, FontMetrics | undefined>()

/**
 * Advance widths for a reading font, or `undefined` when the font has no
 * generated table (callers fall back to unjustified text rather than guessing —
 * a wrong width is worse than no justification).
 */
export function getFontMetrics(id: ReadingFontId): FontMetrics | undefined {
  if (cache.has(id)) return cache.get(id)

  const table = fontMetrics[id]
  if (!table) {
    cache.set(id, undefined)
    return undefined
  }

  // Codepoint → advance, built once per font. The generated form is two
  // parallel arrays so the file stays small; a Map is what lookups want.
  const byCodepoint = new Map<number, number>()
  for (let i = 0; i < table.codepoints.length; i++) {
    byCodepoint.set(table.codepoints[i], table.advances[i])
  }
  const perEm = table.unitsPerEm
  // Unknown glyphs fall back to the space advance rather than 0, so a stray
  // character can only make a line slightly loose, never silently overflow.
  const fallback = byCodepoint.get(32) ?? perEm / 4

  const units = (text: string) => {
    let total = 0
    for (const ch of text) {
      const cp = ch.codePointAt(0) ?? 0
      // A soft hyphen occupies no space unless the line actually breaks there,
      // and justif accounts for the hyphen glyph itself when it does. The app
      // pre-hyphenates prayer text (`lib/hyphenate.ts`), so these arrive
      // routinely — measuring them as real characters would inflate every
      // affected word.
      if (cp === 0x00ad) continue
      total += byCodepoint.get(cp) ?? fallback
    }
    return total
  }

  const substitute = (text: string) => {
    if (!text.includes('f')) return text
    let out = text
    for (const [seq, glyph] of ligatures) {
      if (out.includes(seq)) out = out.split(seq).join(glyph)
    }
    return out
  }

  const metrics: FontMetrics = {
    width: (text, fontSizePx) => (units(substitute(text)) * fontSizePx) / perEm,
    charAdvance: (ch, fontSizePx) => (units(ch) * fontSizePx) / perEm,
  }
  cache.set(id, metrics)
  return metrics
}
