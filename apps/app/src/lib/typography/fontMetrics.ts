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

// Hebrew letter → its precomposed dagesh form (Alphabetic Presentation Forms).
// Heth, final mem, final nun, ayin and final tsadi have none.
const hebrewDageshForms: ReadonlyArray<readonly [letter: number, form: number]> = [
  [0x05d0, 0xfb30],
  [0x05d1, 0xfb31],
  [0x05d2, 0xfb32],
  [0x05d3, 0xfb33],
  [0x05d4, 0xfb34],
  [0x05d5, 0xfb35],
  [0x05d6, 0xfb36],
  [0x05d8, 0xfb38],
  [0x05d9, 0xfb39],
  [0x05da, 0xfb3a],
  [0x05db, 0xfb3b],
  [0x05dc, 0xfb3c],
  [0x05de, 0xfb3e],
  [0x05e0, 0xfb40],
  [0x05e1, 0xfb41],
  [0x05e3, 0xfb43],
  [0x05e4, 0xfb44],
  [0x05e6, 0xfb46],
  [0x05e7, 0xfb47],
  [0x05e8, 0xfb48],
  [0x05e9, 0xfb49],
  [0x05ea, 0xfb4a],
]

/** A point or accent that sits on the letter before it (not maqaf, paseq, sof pasuq or nun hafukha). */
const isHebrewMark = (cp: number) =>
  cp >= 0x0591 && cp <= 0x05c7 && cp !== 0x05be && cp !== 0x05c0 && cp !== 0x05c3 && cp !== 0x05c6

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
  /**
   * How far the ink of `text` runs past its advance box at either end: left
   * of its first glyph's origin, right of its last glyph's advance. What a
   * platform that measures lines by their ink adds to a line that begins or
   * ends with this text.
   */
  overhang: (text: string, fontSizePx: number) => { start: number; end: number }
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
  const overhangs = new Map<number, readonly [left: number, right: number]>()
  for (let i = 0; i < table.overhang.length; i += 3) {
    overhangs.set(table.overhang[i], [table.overhang[i + 1], table.overhang[i + 2]])
  }
  // Unknown glyphs fall back to the WIDEST advance in the face, so a character
  // the table doesn't carry can only leave a line short of the margin.
  // Under-measuring is the direction that costs text: a line that overruns its
  // measure gets re-broken by the platform, which is free to drop what no
  // longer fits.
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

  // Hebrew: a font's shaper (`ccmp`) draws a letter carrying a dagesh as one
  // precomposed glyph, and Ezra SIL's are not all as wide as the bare letter —
  // gimel with dagesh is 58 units wider, bet 50 narrower. Measured as letter +
  // zero-width mark, a line of them overran its measure by a pixel and the
  // platform wrapped it. The dagesh may come after the vowel under the same
  // letter (canonical order puts it after most points), so the letter's whole
  // mark cluster is searched. Letters with no presentation form keep their own.
  const dageshForm = new Map<number, number>()
  for (const [letter, form] of hebrewDageshForms) {
    const advance = byCodepoint.get(form)
    if (advance !== undefined && byCodepoint.has(letter)) dageshForm.set(letter, advance)
  }
  const carriesDagesh = (text: string, from: number) => {
    for (let j = from; j < text.length; j++) {
      const mark = text.charCodeAt(j)
      if (mark === 0x05bc) return true
      if (!isHebrewMark(mark)) return false
    }
    return false
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
      // Hebrew points and accents are positioned on their letter, and the
      // shaper zeroes their advance whatever the font's table says (Ezra SIL
      // gives a few of them 2 units).
      if (isHebrewMark(cp)) continue
      const asDagesh = dageshForm.size && dageshForm.has(cp) && carriesDagesh(text, i + 1)
      total += asDagesh ? (dageshForm.get(cp) as number) : (byCodepoint.get(cp) ?? fallback)
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
    overhang: (text, fontSizePx) => {
      // The ligature is the glyph drawn: a line ending in "off" ends in `ﬀ`.
      const glyphs = [...substitute(text)]
      const first = overhangs.get(glyphs[0]?.codePointAt(0) ?? -1)
      const last = overhangs.get(glyphs.at(-1)?.codePointAt(0) ?? -1)
      return {
        start: ((first?.[0] ?? 0) * fontSizePx) / perEm,
        end: ((last?.[1] ?? 0) * fontSizePx) / perEm,
      }
    },
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
