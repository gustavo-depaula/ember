import type { ReadingFontId } from '@/config/readingFonts'
import {
  type FaceMetrics,
  fontMetrics,
  kernCellAlphabet,
  kernCellOffset,
} from './fontMetrics.generated'

/** Inline emphasis styles the prayer markdown parser can produce. */
export type TextStyleName = 'regular' | 'bold' | 'italic' | 'boldItalic'

// Standard Latin f-ligatures. A font renders `ffl` as ONE narrower glyph, so
// summing the individual advances overstates the word — by 2.5px on "afflict"
// in EB Garamond at 22px, which is enough to overflow a line and cascade a
// re-wrap through the rest of the paragraph.
//
// Which ones a face has is the face's business: EB Garamond ligates all five,
// Merriweather only `fi` and `fl`, so a shaper sets its `affligit` as `af` +
// `ﬂ` + `igit`. The substitution below is built per face from the presentation
// forms its table carries (the generator resolves them through GSUB where the
// cmap has none), longest first so `ffl` wins over `ff` where both exist.
const ligatures: ReadonlyArray<readonly [sequence: string, form: string]> = [
  ['ffl', 'ﬄ'],
  ['ffi', 'ﬃ'],
  ['ff', 'ﬀ'],
  ['fi', 'ﬁ'],
  ['fl', 'ﬂ'],
]

export type FontMetrics = {
  /**
   * Width of `text` at `fontSizePx` as a shaper draws it: advances, the
   * f-ligatures substituted, and pair kerning — unless `kerned` is false,
   * for a run whose kerning the platform has switched off (iOS replaces the
   * font's pair table with a fixed kern the moment `letterSpacing` is set).
   */
  width: (text: string, fontSizePx: number, kerned?: boolean) => number
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
  // Unknown glyphs fall back to the WIDEST advance in the face, so a character
  // the table doesn't carry can only leave a line short of the margin. The
  // space advance — what this used to use — is one of the narrowest glyphs
  // there is, so it under-measured every line it appeared on, and the line then
  // rendered wider than the breaker had placed it. That is the direction that
  // actually costs text: a line that overruns its measure gets re-broken by the
  // platform, which is free to drop what no longer fits.
  let fallback = perEm / 4
  for (const advance of table.advances) if (advance > fallback) fallback = advance

  // Pair kerning, in the class form the generator derived: a codepoint's left
  // and right class, and a dense matrix over the classes. Two Map reads and an
  // index per adjacent pair, which is what the hot path below can afford.
  const leftClass = new Map<number, number>()
  const rightClass = new Map<number, number>()
  for (let i = 0; i < table.kern.left.length; i += 2) {
    leftClass.set(table.kern.left[i], table.kern.left[i + 1])
  }
  for (let i = 0; i < table.kern.right.length; i += 2) {
    rightClass.set(table.kern.right[i], table.kern.right[i + 1])
  }
  // Each row is a dense string, two base-N digits per cell (see the generator).
  const rightClassCount = table.kern.rows.length ? table.kern.rows[0].length / 2 : 0
  const kernMatrix = new Int16Array(table.kern.rows.length * rightClassCount)
  table.kern.rows.forEach((row, left) => {
    for (let right = 0; right < rightClassCount; right++) {
      const hi = kernCellAlphabet.indexOf(row[right * 2])
      const lo = kernCellAlphabet.indexOf(row[right * 2 + 1])
      kernMatrix[left * rightClassCount + right] =
        hi * kernCellAlphabet.length + lo - kernCellOffset
    }
  })
  const kernBetween = (prev: number, cp: number) => {
    const left = leftClass.get(prev)
    if (left === undefined) return 0
    const right = rightClass.get(cp)
    return right === undefined ? 0 : kernMatrix[left * rightClassCount + right]
  }

  // The innermost loop of the justifier: justif measures every cumulative
  // prefix of a word to price its hyphenation breaks, so this runs many times
  // per word per layout. Indexed `charCodeAt` rather than `for...of`, which
  // would allocate an iterator and a one-character string per character.
  const units = (text: string, kerned: boolean) => {
    let total = 0
    let prev = -1
    for (let i = 0; i < text.length; i++) {
      const cp = text.charCodeAt(i)
      // A soft hyphen occupies no space unless the line actually breaks there,
      // and justif accounts for the hyphen glyph itself when it does. The app
      // pre-hyphenates prayer text (`lib/hyphenate.ts`), so these arrive
      // routinely — measuring them as real characters would inflate every
      // affected word. It is invisible to the shaper too, so the pair it sits
      // inside still kerns across it.
      if (cp === 0x00ad) continue
      total += byCodepoint.get(cp) ?? fallback
      if (kerned && prev >= 0) total += kernBetween(prev, cp)
      prev = cp
    }
    return total
  }

  const available = ligatures.filter(([, form]) => byCodepoint.has(form.codePointAt(0) as number))
  const formOf = Object.fromEntries(available)
  // One pass over the word rather than one `split().join()` per ligature.
  const ligatureRe = available.length
    ? new RegExp(available.map(([sequence]) => sequence).join('|'), 'g')
    : undefined
  const substitute = (text: string) =>
    ligatureRe && text.includes('f') ? text.replace(ligatureRe, (m) => formOf[m]) : text

  return {
    width: (text, fontSizePx, kerned = true) =>
      (units(substitute(text), kerned) * fontSizePx) / perEm,
    charAdvance: (ch, fontSizePx) => (units(ch, false) * fontSizePx) / perEm,
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
