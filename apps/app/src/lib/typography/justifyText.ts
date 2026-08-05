import {
  breakParagraph,
  buildItems,
  defaultBreakOptions,
  defaultBuildOptions,
  ItemType,
  layoutLines,
} from 'justif/core'
import { hyphenateEnUS } from 'justif/hyphenate/en-us'
import { createHyphenator } from 'justif/hyphenate/liang'
import { hyphenatePt } from 'justif/hyphenate/pt'

import type { ReadingFontId } from '@/config/readingFonts'
import { getFontMetrics } from './fontMetrics'
import { laLiturgicPatterns } from './hyphenLaLiturgic.generated'

/**
 * Knuth–Plass justification for React Native.
 *
 * RN has no `wordSpacing`, so justif's DOM renderer can't be used — but
 * `justif/core` is DOM-free and takes an injectable `Measure`, which we
 * satisfy from the generated font tables. What comes back is a per-line
 * recipe a `<Text>` tree can express: the words, the exact width of each
 * space, and any letterfit tracking.
 *
 * See `docs/design/typography-justification.md` § Part 6.
 */

export type JustifiedLine = {
  words: string[]
  /** Extra px per inter-word space, on top of the font's natural space. */
  extraSpacePx: number
  /** A hyphen glyph must be drawn at the end of this line. */
  hyphenated: boolean
  /** The line could not be fit within shrink limits; render it ragged. */
  overfull: boolean
}

// Hyphenators are keyed by language and built once — compiling TeX patterns
// into a trie is the expensive part, and justif does it lazily on first use.
const hyphenators = new Map<string, ((word: string) => readonly string[]) | undefined>()

function getHyphenator(language: string | undefined) {
  const lang = (language ?? 'en').toLowerCase()
  const key = lang.startsWith('pt') ? 'pt' : lang.startsWith('la') ? 'la' : 'en'
  if (hyphenators.has(key)) return hyphenators.get(key)

  // All three of the corpus's languages are bundled. Hyphenation is not
  // optional at these measures: a bilingual side-by-side column is ~170px,
  // and without break opportunities the breaker has to open word spaces
  // enormously to fit anything at all.
  const fn =
    key === 'la' ? createHyphenator(laLiturgicPatterns) : key === 'pt' ? hyphenatePt : hyphenateEnUS
  hyphenators.set(key, fn)
  return fn
}

export type JustifyOptions = {
  text: string
  widthPx: number
  fontSizePx: number
  fontFamilyId: ReadingFontId
  language?: string
}

/**
 * Break one paragraph into justified lines. Returns `undefined` when the text
 * can't be justified reliably (no metrics for the font, a nonsense measure, or
 * the breaker gave up) — callers render ordinary wrapped text in that case.
 */
export function justifyText({
  text,
  widthPx,
  fontSizePx,
  fontFamilyId,
  language,
}: JustifyOptions): JustifiedLine[] | undefined {
  if (!text.trim() || !(widthPx > 0) || !(fontSizePx > 0)) return undefined

  const metrics = getFontMetrics(fontFamilyId)
  if (!metrics) return undefined

  const measure = {
    width: (t: string) => metrics.width(t, fontSizePx),
    charAdvance: (ch: string) => metrics.charAdvance(ch, fontSizePx),
  }

  const spaceWidth = measure.width(' ')
  if (!(spaceWidth > 0)) return undefined

  const run = {
    fontKey: `${fontFamilyId}-${fontSizePx}`,
    // TeX's interword glue: a space may stretch by half and shrink by a third.
    space: { width: spaceWidth, stretch: spaceWidth * 0.5, shrink: spaceWidth / 3 },
    hyphenWidth: measure.width('-'),
    // Static fonts — no `wdth` axis to expand along.
    ratioAtMax: 1,
    ratioAtMin: 1,
    familyKey: fontFamilyId,
  }

  const buildOptions = {
    ...defaultBuildOptions,
    hyphenate: getHyphenator(language),
    // Protrusion needs per-glyph ink bearings we don't generate, and hanging
    // punctuation would need negative margins per line — both are refinements
    // on top of the breaking, so they stay off until the basics are on device.
    protrusion: false as const,
    expansion: false as const,
    // Word spaces are the ONLY flex, deliberately. Any flex the breaker is
    // allowed has to be rendered exactly or lines silently re-wrap, and
    // letterfit tracking is a fraction of each line's set width — awkward to
    // reproduce from RN's per-character `letterSpacing`. Spaces we can hit to
    // the pixel. Measured cost of giving up tracking: one line in nineteen.
    tracking: false as const,
  }

  try {
    const para = buildItems([{ text, run: 0 }], [run], buildOptions, measure)
    const breaks = breakParagraph(para, widthPx, { ...defaultBreakOptions })
    const lines = layoutLines(para, breaks, widthPx, buildOptions)
    if (!lines?.length) return undefined

    return lines.map((line) => {
      const words: string[] = []
      let current = ''
      for (let i = line.start; i < line.end; i++) {
        const item = para.items[i]
        if (item.type === ItemType.Box) current += item.text ?? ''
        else if (item.type === ItemType.Glue) {
          if (current) words.push(current)
          current = ''
        }
      }
      if (current) words.push(current)

      const ratio = line.glueRatio ?? 0
      const flex = ratio >= 0 ? run.space.stretch : run.space.shrink
      return {
        words,
        extraSpacePx: ratio * flex,
        hyphenated: !!line.hyphenated,
        overfull: !!line.overfull,
      }
    })
  } catch {
    // Justification is a refinement; text must render regardless.
    return undefined
  }
}
