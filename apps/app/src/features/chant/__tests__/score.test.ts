// @vitest-environment node
// No DOM, as on the phone: the engraver must lay a score out with nothing to measure text against.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { engravableScore, parseGabc } from '../gabc'
import { inkPaths } from '../inkPath'
import { layoutScore, type ScoreLayout, type ScoreText } from '../layoutScore'
import { scoreSvg } from '../scoreSvg'

const chantsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../content/chants',
)
const chants = readdirSync(chantsDir)
  .filter((file) => file.endsWith('.gabc'))
  .map((file) => ({
    id: file.slice(0, -5),
    ...parseGabc(readFileSync(resolve(chantsDir, file), 'utf8')),
  }))
const chant = (id: string) => {
  const found = chants.find((c) => c.id === id)
  if (!found) throw new Error(`no chant ${id}`)
  return found
}

const lyrics = (layout: ScoreLayout) =>
  layout.lines
    .flatMap((line) => line.marks)
    .filter((mark): mark is ScoreText => mark.type === 'text')
    .flatMap((text) => text.runs.map((run) => run.text))

describe('parseGabc', () => {
  it('splits the headers from the score', () => {
    const { headers, score } = chant('kyrie-viii')
    expect(headers).toMatchObject({
      name: 'Kyrie VIII',
      mode: '5',
      commentary: 'XV-XVI. s.',
      book: 'Graduale Romanum, 1961, p. 28*',
    })
    expect(score.startsWith('(c3) KY(d)ri(gxfgh)e')).toBe(true)
  })
})

describe('engravableScore', () => {
  it('drops what only Gregorio-TeX reads and leaves the notes alone', () => {
    expect(
      engravableScore('Ký(k)ri(j)e(kv.) <clear>*(,) (z) <nlba>e(g)lé(e)</nlba>i(e)son.(d.) (::)'),
    ).toBe('Ký(k)ri(j)e(kv.) *(,)  e(g)lé(e)i(e)son.(d.) (::)')
    expect(engravableScore('est.(e.) (::) (Z-)\n~~~<sp>R/</sp>. De(e)o(h)')).toBe(
      'est.(e.) (::) \n   <sp>R/</sp>. De(e)o(h)',
    )
    expect(engravableScore('san(h)cto<v>\\greheightstar</v>(g) <v>\\kern 6mm</v>a(f)')).toBe(
      'san(h)cto*(g) a(f)',
    )
  })
})

describe('layoutScore', () => {
  it('sets every chant in the corpus, with no markup left in the words', () => {
    expect(chants.length).toBeGreaterThan(100)
    for (const { id, score } of chants) {
      for (const width of [320, 720]) {
        const layout = layoutScore(score, { width })
        expect(layout.lines.length, id).toBeGreaterThan(0)
        const leftover = lyrics(layout).filter((text) => /[<>\\{}~]/.test(text))
        expect(leftover, `${id} at ${width}`).toEqual([])
        const ink = inkPaths(layout)
        for (const line of layout.lines) {
          const d = ink(line)
          expect(d.startsWith('M'), id).toBe(true)
          expect(d, id).not.toMatch(/NaN|undefined|Infinity/)
        }
      }
    }
  })

  it('reflows: a narrower page takes more lines, and no mark leaves the page', () => {
    const { score } = chant('gloria-viii')
    const phone = layoutScore(score, { width: 340 })
    const desk = layoutScore(score, { width: 720 })
    expect(phone.lines.length).toBeGreaterThan(desk.lines.length)
    for (const layout of [phone, desk]) {
      for (const mark of layout.lines.flatMap((line) => line.marks)) {
        if (mark.type === 'line') expect(mark.x2).toBeLessThanOrEqual(layout.width + 0.01)
      }
    }
  })

  it('runs the staff to the edge and keeps the notes clear of it', () => {
    const layout = layoutScore(chant('credo-iii').score, { width: 340 })
    const ink = inkPaths(layout)
    for (const line of layout.lines) {
      const staff = line.marks.filter((mark) => mark.type === 'line')
      expect(Math.max(...staff.map((mark) => mark.x2))).toBe(340)
      // The notes alone, as absolute points: every custos ends short of the edge.
      const notes = ink({ ...line, marks: line.marks.filter((mark) => mark.type === 'glyph') })
      const xs = [...notes.matchAll(/(-?[\d.]+) -?[\d.]+/g)].map((m) => Number(m[1]))
      expect(Math.max(...xs)).toBeLessThanOrEqual(334)
    }
  })

  it('opens on a drop cap and keeps the words whole across syllables', () => {
    const layout = layoutScore(chant('sanctus-xviii').score, { width: 340 })
    const first = layout.lines[0].marks.find((mark): mark is ScoreText => mark.type === 'text')
    expect(first?.runs[0].text).toBe('S')
    expect(first?.size).toBeGreaterThan(40)
    expect(lyrics(layout).join('').replace(/[-\s]/g, '')).toContain(
      'Anctus,*Sanctus,SanctusDóminusDeusSábaoth.',
    )
  })

  it('sets the response sign as the glyph, in the rubric colour', () => {
    const layout = layoutScore(chant('ite-i-a').score, { width: 340 })
    const runs = layout.lines
      .flatMap((line) => line.marks)
      .filter((mark): mark is ScoreText => mark.type === 'text')
      .flatMap((text) => text.runs)
    expect(runs.find((run) => run.text === '℟')?.color).toBe('rubric')
    expect(runs.some((run) => /R\//.test(run.text))).toBe(false)
  })

  it('grows with scale', () => {
    const { score } = chant('kyrie-xi')
    const small = layoutScore(score, { width: 340, scale: 0.8 })
    const large = layoutScore(score, { width: 340, scale: 1.4 })
    expect(large.lines.length).toBeGreaterThan(small.lines.length)
    expect(large.lines[0].height).toBeGreaterThan(small.lines[0].height)
  })
})

describe('inkPaths', () => {
  it('places a glyph outline, smooth curves and relative moves resolved', () => {
    const layout: ScoreLayout = {
      width: 100,
      glyphScale: 0.5,
      glyphs: { g: ['M10 10c2 0 4 2 4 4s-2 4-4 4zm20 0h4V20H30z'] },
      lines: [
        {
          top: 0,
          height: 10,
          glyphs: ['g'],
          marks: [{ type: 'glyph', glyph: 'g', x: 100, y: 50 }],
        },
      ],
    }
    expect(inkPaths(layout)(layout.lines[0])).toBe(
      'M105 55C106 55 107 56 107 57C107 58 106 59 105 59ZM115 55L117 55L117 60L115 60Z',
    )
  })
})

describe('scoreSvg', () => {
  it('draws each glyph it defines and nothing undefined', () => {
    const svg = scoreSvg(layoutScore(chant('kyrie-xi').score, { width: 600 }), { idPrefix: 'k-' })
    const defined = new Set([...svg.matchAll(/<g id="([^"]+)"/g)].map((m) => m[1]))
    const used = new Set([...svg.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]))
    expect(used.size).toBeGreaterThan(3)
    for (const id of used) expect(defined.has(id), id).toBe(true)
  })
})
