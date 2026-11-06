import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseGabc } from '../gabc'
import { layoutScore, melodyOf, noteGlyphs } from '../layoutScore'
import { melodyPulse, melodyWav, sungNotes } from '../melody'

const score = (name: string) =>
  parseGabc(
    readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        `../../../../../../content/chants/${name}.gabc`,
      ),
      'utf8',
    ),
  ).score

describe('sungNotes', () => {
  it('sets the top of the tune no higher than the D a congregation reaches', () => {
    const { notes } = sungNotes(melodyOf(score('salve-regina')))
    const top = Math.max(...notes.map((n) => n.frequency))
    // D5 is 587.33 Hz.
    expect(top).toBeLessThanOrEqual(587.34)
  })

  it('lasts as long as its notes and breaths, pulse by pulse', () => {
    const tones = melodyOf(score('kyrie-xi'))
    const beats = tones.reduce((sum, tone) => sum + tone.beats, 0)
    expect(sungNotes(tones).duration).toBeCloseTo(beats * melodyPulse)
  })
})

describe('melodyWav', () => {
  it('is a mono 16-bit WAV as long as the melody', () => {
    const tones = melodyOf(score('kyrie-xi'))
    const wav = melodyWav(tones, 8000)
    const view = new DataView(wav.buffer)
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF')
    expect(String.fromCharCode(...wav.slice(8, 12))).toBe('WAVE')
    expect(view.getUint16(22, true)).toBe(1)
    expect(view.getUint16(34, true)).toBe(16)
    const seconds = view.getUint32(40, true) / 2 / 8000
    expect(seconds).toBeCloseTo(sungNotes(tones).duration + 0.3, 1)
  })
})

describe('the notes a player lights', () => {
  it.each([
    'salve-regina',
    'kyrie-xi',
    'veni-creator-spiritus',
  ])('%s: one box a sounded note, each over a glyph', (name) => {
    const gabc = score(name)
    const tones = melodyOf(gabc)
    const layout = layoutScore(gabc, { width: 340 })
    const notes = layout.lines.flatMap((line) => line.notes)
    expect(notes.map((n) => n.tone)).toEqual(
      tones.flatMap((tone, i) => (tone.pitch === undefined ? [] : [i])),
    )
    // A note drawn as part of a compound shape (a porrectus) has no glyph of its own to light.
    const lit = layout.lines.flatMap((line) =>
      line.notes.filter((n) => noteGlyphs(line, n.tone).length > 0),
    )
    expect(lit.length / notes.length).toBeGreaterThan(0.9)
  })
})
