import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseGabc } from '../gabc'
import { layoutScore, melodyOf, noteInk } from '../layoutScore'
import { melodyPulse, melodyWav, sungNotes } from '../melody'

// A chant by its path under content/ (`chant-propers/in-…`), or its name in content/chants/.
const score = (path: string) =>
  parseGabc(
    readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        `../../../../../../content/${path.includes('/') ? path : `chants/${path}`}.gabc`,
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
    'chants/salve-regina',
    'chants/kyrie-xi',
    'chants/veni-creator-spiritus',
    // A porrectus over "Invocá-": three notes, of which a diagonal draws two.
    'chant-propers/in-invocabit-me-327',
  ])('%s: every sounded note has ink to light', (name) => {
    const gabc = score(name)
    const tones = melodyOf(gabc)
    const layout = layoutScore(gabc, { width: 340 })
    const notes = layout.lines.flatMap((line) => line.notes)
    expect(notes.map((n) => n.tone)).toEqual(
      tones.flatMap((tone, i) => (tone.pitch === undefined ? [] : [i])),
    )
    const unlit = layout.lines.flatMap((line) =>
      line.notes.filter((n) => noteInk(line, n.tone).marks.length === 0),
    )
    expect(unlit).toEqual([])
  })

  it('lights each end of a porrectus, not the whole stroke', () => {
    const gabc = score('chant-propers/in-invocabit-me-327')
    const [line] = layoutScore(gabc, { width: 340 }).lines
    // "Invocá-" sings e!hgh: the porrectus is its notes 4 to 6, after In-vo's three.
    const [first, second, third] = [4, 5, 6].map((tone) => noteInk(line, tone))
    expect(first.marks).toEqual(second.marks)
    expect(first.band).toBeDefined()
    expect(second.band?.top).toBeGreaterThan(first.band?.top ?? 0)
    expect(third.band).toBeUndefined()
  })
})
