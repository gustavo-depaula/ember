// Everything a staff line draws in ink — staff, neumes, bars — as one path.
//
// A score as exsurge describes it is a few thousand small marks, most of them
// a glyph placed by reference. That is the right shape for markup, where a
// `<use>` costs sixty bytes, and the wrong one for react-native-svg, where
// every mark is a native view to create: the Credo would mount some three
// thousand of them. Fused, a line is a single view however many notes it holds.

import type { ScoreLayout, ScoreLine } from './layoutScore'

type Segment = { command: 'M' | 'L' | 'C' | 'Q' | 'Z'; points: number[] }

const argCount: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 }
const token = /([MmLlHhVvCcSsQqTtZz])|(-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?)/g

/** A path as absolute moves, lines and curves only, so it can be re-placed point by point. */
function absoluteSegments(d: string): Segment[] {
  const out: Segment[] = []
  let command = ''
  let args: number[] = []
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  // The last control point, which a smooth curve (`S`, `T`) mirrors.
  let controlX = 0
  let controlY = 0
  let previous = ''

  const flush = () => {
    const upper = command.toUpperCase()
    const relative = command !== upper
    const ox = relative ? x : 0
    const oy = relative ? y : 0
    const a = args
    args = []
    switch (upper) {
      case 'M':
        x = startX = a[0] + ox
        y = startY = a[1] + oy
        out.push({ command: 'M', points: [x, y] })
        // Further pairs after a moveto are linetos.
        command = relative ? 'l' : 'L'
        break
      case 'L':
        x = a[0] + ox
        y = a[1] + oy
        out.push({ command: 'L', points: [x, y] })
        break
      case 'H':
        x = a[0] + ox
        out.push({ command: 'L', points: [x, y] })
        break
      case 'V':
        y = a[0] + oy
        out.push({ command: 'L', points: [x, y] })
        break
      case 'C':
      case 'S': {
        const smooth = upper === 'S'
        const mirrors = previous === 'C' || previous === 'S'
        const c1x = smooth ? (mirrors ? 2 * x - controlX : x) : a[0] + ox
        const c1y = smooth ? (mirrors ? 2 * y - controlY : y) : a[1] + oy
        const rest = smooth ? a : a.slice(2)
        controlX = rest[0] + ox
        controlY = rest[1] + oy
        x = rest[2] + ox
        y = rest[3] + oy
        out.push({ command: 'C', points: [c1x, c1y, controlX, controlY, x, y] })
        break
      }
      case 'Q':
      case 'T': {
        const smooth = upper === 'T'
        const mirrors = previous === 'Q' || previous === 'T'
        controlX = smooth ? (mirrors ? 2 * x - controlX : x) : a[0] + ox
        controlY = smooth ? (mirrors ? 2 * y - controlY : y) : a[1] + oy
        const end = smooth ? a : a.slice(2)
        x = end[0] + ox
        y = end[1] + oy
        out.push({ command: 'Q', points: [controlX, controlY, x, y] })
        break
      }
    }
    previous = upper
  }

  for (const match of d.matchAll(token)) {
    if (match[1]) {
      command = match[1]
      if (command === 'Z' || command === 'z') {
        out.push({ command: 'Z', points: [] })
        x = startX
        y = startY
        previous = 'Z'
      }
      continue
    }
    args.push(Number(match[2]))
    if (args.length === argCount[command.toUpperCase()]) flush()
  }
  return out
}

const round = (n: number) => String(Math.round(n * 100) / 100)

const useScale = /^scale\((-?[\d.e-]+),(-?[\d.e-]+)\)$/

const box = (x: number, y: number, width: number, height: number) =>
  `M${round(x)} ${round(y)}h${round(width)}v${round(height)}h${round(-width)}Z`

/**
 * Builds the ink path of each line of a layout. Glyph outlines are parsed
 * once per layout, however many lines place them.
 */
export function inkPaths(layout: ScoreLayout): (line: ScoreLine) => string {
  const parsed = new Map<string, Segment[]>()
  const segmentsOf = (glyph: string) => {
    let segments = parsed.get(glyph)
    if (!segments) {
      segments = (layout.glyphs[glyph] ?? []).flatMap(absoluteSegments)
      parsed.set(glyph, segments)
    }
    return segments
  }

  return (line) => {
    const parts: string[] = []
    for (const mark of line.marks) {
      if (mark.type === 'line') {
        // Staff and ledger lines are horizontal; a stroke is a thin box.
        parts.push(box(mark.x1, mark.y1 - mark.weight / 2, mark.x2 - mark.x1, mark.weight))
      } else if (mark.type === 'rect') {
        parts.push(box(mark.x, mark.y, mark.width, mark.height))
      } else if (mark.type === 'glyph') {
        // A `<use>` draws its glyph at (x, y) and then applies its own
        // transform, which exsurge only ever uses to stretch a porrectus.
        const stretch = mark.transform ? useScale.exec(mark.transform) : undefined
        if (mark.transform && !stretch) {
          throw new Error(`chant: unexpected glyph transform ${mark.transform}`)
        }
        const sx = stretch ? Number(stretch[1]) : 1
        const sy = stretch ? Number(stretch[2]) : 1
        for (const { command, points } of segmentsOf(mark.glyph)) {
          let segment = command
          for (let i = 0; i < points.length; i += 2) {
            const px = sx * (points[i] * layout.glyphScale + mark.x)
            const py = sy * (points[i + 1] * layout.glyphScale + mark.y)
            segment += `${i ? ' ' : ''}${round(px)} ${round(py)}`
          }
          parts.push(segment)
        }
      }
    }
    return parts.join('')
  }
}
