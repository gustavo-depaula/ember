// A laid-out score as SVG markup, for a surface that takes a string: the
// website's static pages. Colours and faces are left to the page's CSS —
// ink is `currentColor`, the rubric a `rubric` class.

import type { ScoreLayout, ScoreLine, ScoreMark } from './layoutScore'

const round = (n: number) => String(Math.round(n * 100) / 100)

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const faceAttrs = {
  regular: '',
  italic: ' font-style="italic"',
  bold: ' font-weight="700"',
  boldItalic: ' font-weight="700" font-style="italic"',
}

function markSvg(mark: ScoreMark, idPrefix: string): string {
  switch (mark.type) {
    case 'line':
      return `<line x1="${round(mark.x1)}" y1="${round(mark.y1)}" x2="${round(mark.x2)}" y2="${round(mark.y2)}" stroke="currentColor" stroke-width="${round(mark.weight)}"/>`
    case 'rect':
      return `<rect x="${round(mark.x)}" y="${round(mark.y)}" width="${round(mark.width)}" height="${round(mark.height)}"/>`
    case 'shape':
      return `<path d="${mark.d}"/>`
    case 'stroke':
      return `<path d="${mark.d}" fill="none" stroke="currentColor" stroke-width="${round(mark.weight)}"/>`
    case 'glyph':
      return `<use href="#${idPrefix}${mark.glyph}" x="${round(mark.x)}" y="${round(mark.y)}"${mark.transform ? ` transform="${mark.transform}"` : ''}/>`
    case 'text': {
      const runs = mark.runs
        .map(
          (run) =>
            `<tspan${faceAttrs[run.face]}${run.color === 'rubric' ? ' class="rubric"' : ''}>${escapeXml(run.text)}</tspan>`,
        )
        .join('')
      return `<text x="${round(mark.x)}" y="${round(mark.y)}" font-size="${round(mark.size)}" text-anchor="${mark.anchor}">${runs}</text>`
    }
  }
}

function lineSvg(line: ScoreLine, y: number, idPrefix: string): string {
  return `<g transform="translate(0,${round(y - line.top)})">${line.marks.map((m) => markSvg(m, idPrefix)).join('')}</g>`
}

/**
 * The whole score as one `<svg>`, its lines stacked. `idPrefix` keeps the
 * glyph definitions of two scores on one page from colliding.
 */
export function scoreSvg(layout: ScoreLayout, { idPrefix = '', label = '' } = {}): string {
  let y = 0
  const lines = layout.lines.map((line) => {
    const svg = lineSvg(line, y, idPrefix)
    y += line.height
    return svg
  })
  const defs = Object.entries(layout.glyphs)
    .map(
      ([id, paths]) =>
        `<g id="${idPrefix}${id}" transform="scale(${layout.glyphScale})">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`,
    )
    .join('')
  const aria = label ? ` role="img" aria-label="${escapeXml(label)}"` : ' aria-hidden="true"'
  return `<svg xmlns="http://www.w3.org/2000/svg" class="score" viewBox="0 0 ${round(layout.width)} ${round(y)}" width="${round(layout.width)}" height="${round(y)}" fill="currentColor"${aria}><defs>${defs}</defs>${lines.join('')}</svg>`
}
