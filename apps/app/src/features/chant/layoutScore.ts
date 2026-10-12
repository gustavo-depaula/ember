// Sets a GABC score in square notes for a given width.
//
// The engraving is exsurge's. It is asked for its drawing as a tree and never
// for a DOM node, and it measures lyrics with the advance-width tables the
// native justifier already ships (`lib/typography/fontMetrics`), so the same
// call lays a score out on a phone, in Node for the website and in a browser,
// with no text engine underneath. What comes back is flat and plain: per staff
// line, a list of marks in that line's own coordinates, for a renderer that
// only has to draw them.

import * as exsurgeModule from 'exsurge'
import { getFontMetrics, type TextStyleName } from '@/lib/typography/fontMetrics'
import { engravableScore } from './gabc'
import { absoluteSegments, placed } from './pathData'

export type ScoreColor = 'ink' | 'rubric'

export type ScoreText = {
  type: 'text'
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
  size: number
  runs: Array<{ text: string; face: TextStyleName; color: ScoreColor }>
}

export type ScoreMark =
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; weight: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number }
  | { type: 'glyph'; glyph: string; x: number; y: number; transform?: string }
  // A filled outline drawn for this place alone, in absolute path data: the beam of a porrectus.
  | { type: 'shape'; d: string }
  // A line drawn, not filled: the brace under a group of notes.
  | { type: 'stroke'; d: string; weight: number }
  | ScoreText

export type ScoreLine = {
  /** Top of the line's box, in its own coordinates: marks sit at y ≥ top. */
  top: number
  height: number
  marks: ScoreMark[]
  /** The glyphs this line draws, for a renderer that defines them per line. */
  glyphs: string[]
}

export type ScoreLayout = {
  width: number
  lines: ScoreLine[]
  /** Outline of each glyph the score uses, in glyph units; draw at `glyphScale`. */
  glyphs: Record<string, string[]>
  glyphScale: number
}

export type ScoreOptions = {
  width: number
  /** 1 is the size of a hand missal: 18px lyrics under a 37px staff. */
  scale?: number
}

const lyricSize = 18
const glyphScaling = 1 / 16
// exsurge ends a line on its custos — the small guide to the next line's first
// note — set flush with the end of the staff. Flush with the edge of a screen,
// a custos reads as a note the screen cut in half, so the staff runs on past
// it by this much, as it does in a printed book.
const staffTail = 7

// exsurge reads a font two ways: an advance, and the box of the ink. The box
// only ever positions a syllable under its notes and stacks the text rows, so
// the face's own ascent and descent serve — and keep every row the same height,
// where real ink would move a row by whether it happens to hold a `p`.
const ascent = 0.72
const descent = 0.26

function measuringFont(face: TextStyleName) {
  const metrics = getFontMetrics('eb-garamond', face)
  if (!metrics) throw new Error(`chant: EB Garamond ${face} has no metrics`)
  return {
    getAdvanceWidth: (text: string, size: number) => metrics.width(text, size),
    getPath: (text: string, x: number, y: number, size: number) => ({
      getBoundingBox: () => ({
        x1: x - metrics.overhang(text, size).start,
        y1: y - ascent * size,
        x2: x + metrics.width(text, size),
        y2: y + descent * size,
      }),
    }),
  }
}

let fonts: Record<string, ReturnType<typeof measuringFont>> | undefined

function fontDictionary() {
  fonts ??= {
    Regular: measuringFont('regular'),
    Italic: measuringFont('italic'),
    Bold: measuringFont('bold'),
    BoldItalic: measuringFont('boldItalic'),
  }
  return fonts
}

type Tree = { name: string; props: Record<string, unknown>; children?: Array<Tree | string> }

// The part of exsurge this module drives. Its own declarations stop short of
// the tree output and the glyph definitions.
type Context = {
  textColor: string
  specialCharProperties: Record<string, string>
  specialCharText: (char: string) => string
  textAfterSpecialChar: string
  textStyles: Record<string, { size: number }>
  makeDefs: Array<{ makeSvgTree: () => Tree }>
  glyphScaling: number
  setRubricColor: (color: string) => void
  setFont: (family: string, size: number, baseStyle: object, fonts: object) => void
  setGlyphScaling: (scaling: number) => void
}
type Line = {
  bounds: { y: number; height: number }
  origin: { y: number }
  createSvgTree: (ctxt: Context, top: number) => Tree
}
type Score = {
  lines: Line[]
  performLayout: (ctxt: Context) => void
  layoutChantLines: (ctxt: Context, width: number) => void
}
type Exsurge = {
  ChantContext: new (measuring: number) => Context
  ChantScore: new (ctxt: Context, mappings: unknown, dropCap: boolean) => Score
  Gabc: { createMappingsFromSource: (ctxt: Context, gabc: string) => unknown }
  TextMeasuringStrategy: { OpenTypeJS: number }
  TextTypes: Record<string, { cssClass: string }>
}
// exsurge ships one CommonJS bundle. Metro hands its exports over as the
// namespace; Node's ESM loader, which builds the website, as the default.
const loaded = exsurgeModule as unknown as Exsurge & { default?: Exsurge }
const exsurge = loaded.default ?? loaded

// Stand-ins for the colours exsurge writes into its drawing. The renderer owns
// the palette — a theme change must not cost a layout.
const ink = '#000001'
const rubric = '#000002'

const versicleSigns: Record<string, string> = { r: '℟', v: '℣' }

function context(scale: number) {
  const ctxt = new exsurge.ChantContext(exsurge.TextMeasuringStrategy.OpenTypeJS)
  ctxt.textColor = ink
  ctxt.setRubricColor(rubric)
  // ℣ and ℟ come from exsurge's own symbol font by default. EB Garamond has
  // both, so they are set as text in the rubric colour. The family named here
  // is never drawn, but has to differ from the lyrics': exsurge takes a first
  // syllable in the symbols' family for a versicle sign and skips the drop cap.
  ctxt.specialCharProperties = { 'font-family': 'versicle', fill: rubric }
  ctxt.specialCharText = (char: string) => versicleSigns[char.toLowerCase()] ?? char
  // The transcriptions write the sign's full stop themselves.
  ctxt.textAfterSpecialChar = ''
  // exsurge derives every text size from one base: lyrics at 0.9 of it, the
  // drop cap at 4×, which stands taller than the staff it opens.
  ctxt.setFont('EB Garamond', (lyricSize / 0.9) * scale, {}, fontDictionary())
  ctxt.textStyles.dropCap.size = lyricSize * 3 * scale
  ctxt.setGlyphScaling(glyphScaling * scale)
  return ctxt
}

export function layoutScore(gabc: string, { width, scale = 1 }: ScoreOptions): ScoreLayout {
  const ctxt = context(scale)
  const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, engravableScore(gabc))
  const score = new exsurge.ChantScore(ctxt, mappings, true)
  score.performLayout(ctxt)
  const tail = staffTail * scale
  const setWidth = width - tail
  score.layoutChantLines(ctxt, setWidth)

  const sizes: Record<string, number> = {}
  for (const [key, type] of Object.entries(exsurge.TextTypes)) {
    sizes[type.cssClass] = ctxt.textStyles[key].size
  }

  const glyphs: Record<string, string[]> = {}
  for (const makeDef of ctxt.makeDefs) {
    const def = makeDef.makeSvgTree()
    glyphs[String(def.props.id)] = outlines(def)
  }

  const lines = score.lines.map((line): ScoreLine => {
    const marks: ScoreMark[] = []
    const used = new Set<string>()
    collect(line.createSvgTree(ctxt, line.bounds.y), 0, 0, sizes, marks, used)
    for (const mark of marks) {
      // Only the staff reaches the end of the line; a ledger line stops short.
      if (mark.type === 'line' && mark.x2 > setWidth - 0.01) mark.x2 = width
    }
    return { top: -line.origin.y, height: line.bounds.height, marks, glyphs: [...used] }
  })

  return { width, lines, glyphs, glyphScale: ctxt.glyphScaling }
}

function outlines(node: Tree): string[] {
  if (node.name === 'path') return [String(node.props.d)]
  return (node.children ?? []).flatMap((child) =>
    typeof child === 'string' ? [] : outlines(child),
  )
}

const translate = /^translate\((-?[\d.e-]+),(-?[\d.e-]+)\)$/

function collect(
  node: Tree,
  dx: number,
  dy: number,
  sizes: Record<string, number>,
  marks: ScoreMark[],
  used: Set<string>,
) {
  const p = node.props
  const num = (key: string) => Number(p[key])
  switch (node.name) {
    case 'g': {
      const shift = typeof p.transform === 'string' ? translate.exec(p.transform) : undefined
      if (p.transform && !shift) throw new Error(`chant: unexpected transform ${p.transform}`)
      const x = dx + (shift ? Number(shift[1]) : 0)
      const y = dy + (shift ? Number(shift[2]) : 0)
      for (const child of node.children ?? []) {
        if (typeof child !== 'string') collect(child, x, y, sizes, marks, used)
      }
      return
    }
    case 'line':
      marks.push({
        type: 'line',
        x1: num('x1') + dx,
        y1: num('y1') + dy,
        x2: num('x2') + dx,
        y2: num('y2') + dy,
        weight: num('strokeWidth'),
      })
      return
    case 'rect':
      // The cursor box of exsurge's editor mode is the one unfilled rect.
      if (p.fill === 'none') return
      marks.push({
        type: 'rect',
        x: num('x') + dx,
        y: num('y') + dy,
        width: num('width'),
        height: num('height'),
      })
      return
    case 'polygon': {
      const points = String(p.points)
        .trim()
        .split(/[\s,]+/)
        .map(Number)
      const segments = points.flatMap((_, i) =>
        i % 2
          ? []
          : [{ command: i ? ('L' as const) : ('M' as const), points: [points[i], points[i + 1]] }],
      )
      marks.push({ type: 'shape', d: `${placed(segments, (x, y) => [x + dx, y + dy])}Z` })
      return
    }
    case 'path': {
      const d = placed(absoluteSegments(String(p.d)), (x, y) => [x + dx, y + dy])
      if (p.fill === 'none')
        marks.push({ type: 'stroke', d, weight: parseFloat(String(p.strokeWidth)) })
      else marks.push({ type: 'shape', d })
      return
    }
    case 'use': {
      const glyph = String(p.xlinkHref).slice(1)
      used.add(glyph)
      marks.push({
        type: 'glyph',
        glyph,
        x: num('x') + dx,
        y: num('y') + dy,
        ...(typeof p.transform === 'string' ? { transform: p.transform } : {}),
      })
      return
    }
    case 'text': {
      const classes = String(p.className ?? '').split(' ')
      const size = classes.map((c) => sizes[c]).find((s) => s !== undefined)
      if (size === undefined) throw new Error(`chant: text of unknown kind "${p.className}"`)
      const own = p.style as { fill?: string } | undefined
      const runs = (node.children ?? []).flatMap((child) => {
        if (typeof child === 'string') return []
        const text = (child.children ?? []).filter((c) => typeof c === 'string').join('')
        if (!text) return []
        const style = (child.props.style ?? {}) as {
          fill?: string
          fontStyle?: string
          fontWeight?: string
        }
        const bold = style.fontWeight === 'bold'
        const italic = style.fontStyle === 'italic'
        const face: TextStyleName = bold
          ? italic
            ? 'boldItalic'
            : 'bold'
          : italic
            ? 'italic'
            : 'regular'
        const color: ScoreColor = (style.fill ?? own?.fill) === rubric ? 'rubric' : 'ink'
        return [{ text, face, color }]
      })
      if (!runs.length) return
      const anchor = p.textAnchor === 'middle' || p.textAnchor === 'end' ? p.textAnchor : 'start'
      marks.push({ type: 'text', x: num('x') + dx, y: num('y') + dy, anchor, size, runs })
      return
    }
    default:
      throw new Error(`chant: unexpected <${node.name}> in a score`)
  }
}
