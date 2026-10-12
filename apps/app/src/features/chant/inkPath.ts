// Everything a staff line draws in ink — staff, neumes, bars — as one path.
//
// A score as exsurge describes it is a few thousand small marks, most of them
// a glyph placed by reference. That is the right shape for markup, where a
// `<use>` costs sixty bytes, and the wrong one for react-native-svg, where
// every mark is a native view to create: the Credo would mount some three
// thousand of them. Fused, a line is a single view however many notes it holds.

import type { ScoreLayout, ScoreLine } from './layoutScore'
import { absoluteSegments, placed, type Segment } from './pathData'

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
      } else if (mark.type === 'shape') {
        parts.push(mark.d)
      } else if (mark.type === 'glyph') {
        // A `<use>` draws its glyph at (x, y) and then applies its own
        // transform, which exsurge only ever uses to stretch a porrectus.
        const stretch = mark.transform ? useScale.exec(mark.transform) : undefined
        if (mark.transform && !stretch) {
          throw new Error(`chant: unexpected glyph transform ${mark.transform}`)
        }
        const sx = stretch ? Number(stretch[1]) : 1
        const sy = stretch ? Number(stretch[2]) : 1
        parts.push(
          placed(segmentsOf(mark.glyph), (x, y) => [
            sx * (x * layout.glyphScale + mark.x),
            sy * (y * layout.glyphScale + mark.y),
          ]),
        )
      }
    }
    return parts.join('')
  }
}
