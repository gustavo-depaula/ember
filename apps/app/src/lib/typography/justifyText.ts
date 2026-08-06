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
import { type FontMetrics, getFontMetrics, type TextStyleName } from './fontMetrics'
import { laLiturgicPatterns } from './hyphenLaLiturgic.generated'

/**
 * Knuth–Plass justification for React Native.
 *
 * RN has no `wordSpacing`, so justif's DOM renderer can't be used — but
 * `justif/core` is DOM-free and takes an injectable `Measure`, which we
 * satisfy from the generated font tables. What comes back is a per-line
 * recipe a `<Text>` tree can express: styled pieces, and the exact width of
 * the space that follows each.
 *
 * See `docs/design/typography-justification.md` § Part 6.
 */

/** A run of text in one inline style — the output of `parseInline`. */
export type StyledSegment = { text: string; style: TextStyleName }

/**
 * A stretch of same-styled text on a line.
 *
 * Pieces are not words: `*Mater Dei*,` renders the comma in regular while the
 * rest is italic, so a single word can span two pieces. When `spaceAfter` is
 * absent mid-line, the next piece continues the same word.
 */
export type JustifiedPiece = {
  text: string
  style: TextStyleName
  /**
   * The space that follows, when one does. `extraPx` is added on top of the
   * space glyph's natural advance, and `style` says which face draws it — a
   * space inside an italic run is naturally a different width from a regular
   * one, so the renderer has to match both.
   */
  spaceAfter?: { extraPx: number; style: TextStyleName }
}

export type JustifiedLine = {
  pieces: JustifiedPiece[]
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
  /** Plain text, or styled segments when the line carries inline emphasis. */
  source: string | StyledSegment[]
  widthPx: number
  fontSizePx: number
  fontFamilyId: ReadingFontId
  language?: string
}

/**
 * Break one paragraph into justified lines, across mixed inline styles.
 *
 * Emphasis is not a special case: `buildItems` takes an array of runs precisely
 * so a paragraph can mix faces, and each style contributes its own metrics and
 * its own word-space width. Returns `undefined` when the result can't be
 * trusted (a face whose rendered width is unknowable, a nonsense measure, or
 * the breaker giving up) — callers render ordinary wrapped text in that case.
 */
export function justifyText({
  source,
  widthPx,
  fontSizePx,
  fontFamilyId,
  language,
}: JustifyOptions): JustifiedLine[] | undefined {
  const segments: StyledSegment[] = (
    typeof source === 'string' ? [{ text: source, style: 'regular' as const }] : source
  ).filter((s) => s.text.length > 0)

  if (!segments.some((s) => s.text.trim())) return undefined
  if (!(widthPx > 0) || !(fontSizePx > 0)) return undefined

  // One justif run per distinct style present, each with its own face metrics.
  // A missing face means the platform would synthesize a width we can't
  // predict, so the whole line declines rather than drifting — resolved up
  // front so an unjustifiable line costs one map lookup, not a run build.
  const styles = [...new Set(segments.map((s) => s.style))]
  const faces = styles.map((style) => getFontMetrics(fontFamilyId, style))
  if (faces.some((m) => !m)) return undefined

  const runs = []
  for (const [i, style] of styles.entries()) {
    const metrics = faces[i] as FontMetrics
    const spaceWidth = metrics.width(' ', fontSizePx)
    if (!(spaceWidth > 0)) return undefined

    runs.push({
      fontKey: `${fontFamilyId}-${style}-${fontSizePx}`,
      // TeX's interword glue: a space may stretch by half and shrink by a third.
      space: { width: spaceWidth, stretch: spaceWidth * 0.5, shrink: spaceWidth / 3 },
      hyphenWidth: metrics.width('-', fontSizePx),
      // Static faces — no `wdth` axis to expand along.
      ratioAtMax: 1,
      ratioAtMin: 1,
      // Same family throughout, so spaces at a regular/italic boundary keep
      // their shrink — justif only protects boundaries between font families.
      familyKey: fontFamilyId,
      metrics,
    })
  }

  // justif measures a run's text through the paragraph-wide `Measure`, handing
  // back the run so we can route to that face's table. Method shorthand rather
  // than arrow properties: methods are bivariant, so this satisfies justif's
  // `Measure` without widening its type at the call site.
  type Run = (typeof runs)[number]
  const measure = {
    width(t: string, run: Run) {
      return run.metrics.width(t, fontSizePx)
    },
    charAdvance(ch: string, run: Run) {
      return run.metrics.charAdvance(ch, fontSizePx)
    },
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
    const texts = segments.map((s) => ({ text: s.text, run: styles.indexOf(s.style) }))
    const para = buildItems(texts, runs, buildOptions, measure)
    const breaks = breakParagraph(para, widthPx, { ...defaultBreakOptions })
    const lines = layoutLines(para, breaks, widthPx, buildOptions)
    if (!lines?.length) return undefined

    return lines.map((line) => {
      const pieces: JustifiedPiece[] = []
      const ratio = line.glueRatio ?? 0

      for (let i = line.start; i < line.end; i++) {
        const item = para.items[i]
        if (item.type === ItemType.Box) {
          const style = styles[item.run]
          const last = pieces.at(-1)
          // Merge only across a style-preserving boundary that has no space,
          // so hyphenation fragments and mid-word style changes stay intact.
          if (last && last.style === style && last.spaceAfter === undefined) {
            last.text += item.text ?? ''
          } else {
            pieces.push({ text: item.text ?? '', style })
          }
        } else if (item.type === ItemType.Glue) {
          const last = pieces.at(-1)
          if (!last) continue
          // Each glue carries its own spec, so a space in an italic run flexes
          // against italic's space width — not a line-wide average.
          last.spaceAfter = {
            extraPx: ratio * (ratio >= 0 ? item.stretch : item.shrink),
            style: styles[item.run],
          }
        }
      }

      return {
        pieces,
        hyphenated: !!line.hyphenated,
        overfull: !!line.overfull,
      }
    })
  } catch {
    // Justification is a refinement; text must render regardless.
    return undefined
  }
}
