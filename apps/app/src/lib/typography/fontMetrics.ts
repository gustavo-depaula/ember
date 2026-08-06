import type { ReadingFontId } from '@/config/readingFonts'
import { type FaceMetrics, fontMetrics } from './fontMetrics.generated'

/** Inline emphasis styles the prayer markdown parser can produce. */
export type TextStyleName = 'regular' | 'bold' | 'italic' | 'boldItalic'

// Standard Latin f-ligatures. A font renders `ffl` as ONE narrower glyph, so
// summing the individual advances overstates the word — by 2.5px on "afflict"
// in EB Garamond at 22px, which is enough to overflow a line and cascade a
// re-wrap through the rest of the paragraph.
const ligatures: Record<string, string> = {
  ffl: 'ﬄ',
  ffi: 'ﬃ',
  ff: 'ﬀ',
  fi: 'ﬁ',
  fl: 'ﬂ',
}
// Longest alternative first, so `ffl` wins over `ff`. One pass over the word
// rather than five `split().join()` rounds.
const ligatureRe = /ffl|ffi|ff|fi|fl/g

export type FontMetrics = {
  /** Advance of `text` at `fontSizePx`, ligatures accounted for. */
  width: (text: string, fontSizePx: number) => number
  /** Advance of a single character — justif uses it for protrusion credit. */
  charAdvance: (ch: string, fontSizePx: number) => number
}

// Nested so a lookup costs no key-string allocation on the hot path.
const cache = new Map<ReadingFontId, Map<TextStyleName, FontMetrics | undefined>>()

function build(table: FaceMetrics): FontMetrics {
  // Codepoint → advance, built once per face. The generated form is two
  // parallel arrays so the file stays small; a Map is what lookups want.
  const byCodepoint = new Map<number, number>()
  for (let i = 0; i < table.codepoints.length; i++) {
    byCodepoint.set(table.codepoints[i], table.advances[i])
  }
  const perEm = table.unitsPerEm
  // Unknown glyphs fall back to the space advance rather than 0, so a stray
  // character can only make a line slightly loose, never silently overflow.
  const fallback = byCodepoint.get(32) ?? perEm / 4

  // The innermost loop of the justifier: justif measures every cumulative
  // prefix of a word to price its hyphenation breaks, so this runs many times
  // per word per layout. Indexed `charCodeAt` rather than `for...of`, which
  // would allocate an iterator and a one-character string per character.
  const units = (text: string) => {
    let total = 0
    for (let i = 0; i < text.length; i++) {
      const cp = text.charCodeAt(i)
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

  const substitute = (text: string) =>
    text.includes('f') ? text.replace(ligatureRe, (m) => ligatures[m]) : text

  return {
    width: (text, fontSizePx) => (units(substitute(text)) * fontSizePx) / perEm,
    charAdvance: (ch, fontSizePx) => (units(ch) * fontSizePx) / perEm,
  }
}

/**
 * Advance widths for one face of a reading font.
 *
 * Returns `undefined` when the rendered width can't be known, and callers fall
 * back to unjustified text rather than guessing — a wrong width doesn't look
 * slightly off, it overflows the line and re-wraps the paragraph.
 *
 * Where the app doesn't load a real face, the platform synthesizes the
 * emphasis, and the two synthetic styles behave differently:
 *
 * - **Italic** is an oblique shear. It slants the glyphs without changing their
 *   advances, so the regular face's metrics stay exact.
 * - **Bold** is an emboldening smear whose advance growth is platform- and
 *   version-specific. It is not predictable from the regular face, so we
 *   decline rather than guess.
 */
export function getFontMetrics(
  id: ReadingFontId,
  style: TextStyleName = 'regular',
): FontMetrics | undefined {
  let byStyle = cache.get(id)
  if (!byStyle) {
    byStyle = new Map()
    cache.set(id, byStyle)
  }
  if (byStyle.has(style)) return byStyle.get(style)

  const faces = fontMetrics[id]
  const real = faces?.[style]
  // Synthetic italic falls back to the regular table — and to the lookup
  // already built from it, rather than a second copy of the same ~200 entries.
  const metrics = real
    ? build(real)
    : style === 'italic'
      ? getFontMetrics(id, 'regular')
      : undefined
  byStyle.set(style, metrics)
  return metrics
}
