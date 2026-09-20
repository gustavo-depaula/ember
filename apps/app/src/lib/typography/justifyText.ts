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

import type { TextStyle } from 'react-native'

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

/**
 * One inline run of a paragraph — justif's `RunMetrics` is documented as "one
 * styling context inside a paragraph (the paragraph itself, an `<em>`, a size
 * change…)", so a run is free to differ from its neighbours in more than face.
 *
 * `style`, `fontSizePx` and `letterSpacing` are the three things that change an
 * ADVANCE, so they are modelled here and measured. `render` is everything that
 * doesn't — colour, opacity, leading — and rides through to the renderer
 * untouched. It must never carry `fontFamily`, `fontSize` or `letterSpacing`:
 * the breaker would place lines against metrics the screen then contradicts.
 */
export type StyledSegment = {
  text: string
  style: TextStyleName
  /** Size for this run when it differs from the paragraph's — a superscript
   *  verse number, a ℣/℟ mark set 1.15× to match surrounding capitals. */
  fontSizePx?: number
  /** React Native's `letterSpacing`, which adds after every character. Real
   *  width, so it is measured rather than ignored. */
  letterSpacing?: number
  /**
   * Draw-only props. Anything that would change an advance belongs above.
   *
   * Applied by the renderer as a raw RN `style`, so colours must be RESOLVED
   * values — a Tamagui token like `$colorSecondary` does not resolve inside
   * `style` and renders as no colour at all. Read it off `useTheme()` first.
   */
  render?: TextStyle
  /** Carried onto every piece the run produces, so a cross-reference stays
   *  tappable after the breaker has split it across two lines. */
  onPress?: () => void
  /** An atom: never hyphenated, never broken inside, and its own spaces do not
   *  flex. A scripture citation is one object, not three stretchable words. */
  atomic?: boolean
}

/** What a piece needs in order to be drawn — the run's appearance, flattened. */
export type Appearance = Pick<
  StyledSegment,
  'style' | 'fontSizePx' | 'letterSpacing' | 'render' | 'onPress'
>

// Soft hyphens render as nothing unless the line breaks there, so they must not
// earn letter-spacing either.
const spacedLength = (text: string) => {
  let n = 0
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) !== 0x00ad) n++
  return n
}

/** A justif `RunMetrics`, plus what we need to measure and redraw the run. */
type JustifRun = {
  fontKey: string
  space: { width: number; stretch: number; shrink: number }
  hyphenWidth: number
  ratioAtMax: number
  ratioAtMin: number
  familyKey: string
  noHyphens?: true
  metrics: FontMetrics
  sizePx: number
  letterSpacingPx: number
  appearance: Appearance
}

const sameLook = (a: Appearance, b: Appearance) =>
  a.style === b.style &&
  a.fontSizePx === b.fontSizePx &&
  a.letterSpacing === b.letterSpacing &&
  a.render === b.render &&
  a.onPress === b.onPress

/**
 * A stretch of same-styled text on a line.
 *
 * Pieces are not words: `*Mater Dei*,` renders the comma in regular while the
 * rest is italic, so a single word can span two pieces. When `spaceAfter` is
 * absent mid-line, the next piece continues the same word.
 */
export type JustifiedPiece = Appearance & {
  text: string
  /**
   * The space that follows, when one does. `extraPx` is added on top of the
   * space glyph's natural advance, and the appearance says which run draws it —
   * a space inside an italic run is naturally a different width from a regular
   * one, and one inside a 0.55× verse number is different again, so the
   * renderer has to match whichever run the breaker priced it against.
   */
  spaceAfter?: Appearance & { extraPx: number }
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

  // One justif run per distinct APPEARANCE, not merely per face — a size change
  // or a press handler is its own styling context. Over-splitting is harmless
  // (every run declares the same `familyKey`, so no boundary loses its shrink);
  // under-splitting would merge two cross-references into one tap target.
  //
  // `render` and `onPress` are compared by identity, so callers should build
  // them under a memo; a fresh object each render costs an extra run, never a
  // wrong break.
  const identities = new Map<unknown, number>()
  const identity = (v: unknown) => {
    if (v === undefined) return 0
    let id = identities.get(v)
    if (id === undefined) {
      id = identities.size + 1
      identities.set(v, id)
    }
    return id
  }
  const keyOf = (s: StyledSegment) =>
    `${s.style}|${s.fontSizePx ?? fontSizePx}|${s.letterSpacing ?? 0}|${s.atomic ? 1 : 0}|${identity(s.render)}|${identity(s.onPress)}`

  const runIndex = new Map<string, number>()
  const runs: JustifRun[] = []
  for (const segment of segments) {
    const key = keyOf(segment)
    if (runIndex.has(key)) continue
    // A missing face means the platform would synthesize a width we can't
    // predict, so the whole paragraph declines rather than drifting.
    const metrics = getFontMetrics(fontFamilyId, segment.style)
    if (!metrics) return undefined

    const sizePx = segment.fontSizePx ?? fontSizePx
    const letterSpacingPx = segment.letterSpacing ?? 0
    if (!(sizePx > 0)) return undefined
    const spaceWidth = metrics.width(' ', sizePx) + letterSpacingPx
    if (!(spaceWidth > 0)) return undefined

    runIndex.set(key, runs.length)
    runs.push({
      fontKey: `${fontFamilyId}-${key}`,
      // TeX's interword glue: a space may stretch by half and shrink by a third.
      // An atom's spaces are rigid — a citation reading "PS.    87:9" is exactly
      // what the old fixed-width-space workaround in `VerseRef` was dodging.
      space: segment.atomic
        ? { width: spaceWidth, stretch: 0, shrink: 0 }
        : { width: spaceWidth, stretch: spaceWidth * 0.5, shrink: spaceWidth / 3 },
      hyphenWidth: metrics.width('-', sizePx),
      // Static faces — no `wdth` axis to expand along.
      ratioAtMax: 1,
      ratioAtMin: 1,
      // Same family throughout, so spaces at a regular/italic boundary keep
      // their shrink — justif only protects boundaries between font families.
      familyKey: fontFamilyId,
      ...(segment.atomic ? { noHyphens: true as const } : {}),
      metrics,
      sizePx,
      letterSpacingPx,
      appearance: {
        style: segment.style,
        fontSizePx: segment.fontSizePx,
        letterSpacing: segment.letterSpacing,
        render: segment.render,
        onPress: segment.onPress,
      } satisfies Appearance,
    })
  }

  // justif measures a run's text through the paragraph-wide `Measure`, handing
  // back the run so we can route to that face's table. Method shorthand rather
  // than arrow properties: methods are bivariant, so this satisfies justif's
  // `Measure` without widening its type at the call site.
  const measure = {
    width(t: string, run: JustifRun) {
      return run.metrics.width(t, run.sizePx) + run.letterSpacingPx * spacedLength(t)
    },
    charAdvance(ch: string, run: JustifRun) {
      return run.metrics.charAdvance(ch, run.sizePx) + run.letterSpacingPx
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
    const texts = segments.map((s, i) => ({
      text: s.text,
      run: runIndex.get(keyOf(s)) as number,
      // Per SEGMENT rather than per run: two citations sharing an appearance
      // must still allow a break between them, they are separate atoms.
      ...(s.atomic ? { atomicKey: i + 1 } : {}),
    }))
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
          const look = runs[item.run].appearance
          const last = pieces.at(-1)
          // Merge only across an appearance-preserving boundary that has no
          // space, so hyphenation fragments stay whole while a mid-word change
          // of face, size or tap target stays its own piece.
          if (last && sameLook(last, look) && last.spaceAfter === undefined) {
            last.text += item.text ?? ''
          } else {
            pieces.push({ text: item.text ?? '', ...look })
          }
        } else if (item.type === ItemType.Glue) {
          const last = pieces.at(-1)
          if (!last) continue
          // Each glue carries its own spec, so a space in an italic run flexes
          // against italic's space width — not a line-wide average.
          last.spaceAfter = {
            extraPx: ratio * (ratio >= 0 ? item.stretch : item.shrink),
            ...runs[item.run].appearance,
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
