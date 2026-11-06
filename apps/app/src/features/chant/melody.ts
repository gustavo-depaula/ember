// A chant's melody as sound: a plain tone, one note after another at the pulse
// of sung prayer — a guide to the tune, not a performance of it. The website
// sounds it through Web Audio (apps/site/src/scripts/sing.ts) and the app as a
// rendered WAV; both take their notes from here, so the two sing alike.

import type { Tone } from './layoutScore'

/** Seconds a plain note lasts. */
export const melodyPulse = 0.36
// The staff's `do` is written as C; pitches count semitones from the C an octave below it.
const midiOfZero = 48
// Chant has no fixed pitch: it is set where a congregation sings, the top of the tune near D.
const highestMidi = 74
// Each note leans into the next, as a voice does on one breath.
const attack = 0.04
// The fall begins this long before the note ends and finishes this long after.
const fallFrom = 0.05
const fallTo = 0.03

export type SungNote = { frequency: number; start: number; length: number }

/** The notes of a melody as frequencies and times, and how long it lasts, in seconds. */
export function sungNotes(tones: Tone[]): { notes: SungNote[]; duration: number } {
  const pitches = tones.flatMap((tone) => (tone.pitch === undefined ? [] : [tone.pitch]))
  const shift = pitches.length ? Math.min(0, highestMidi - (Math.max(...pitches) + midiOfZero)) : 0
  const notes: SungNote[] = []
  let at = 0
  for (const tone of tones) {
    const length = tone.beats * melodyPulse
    if (tone.pitch !== undefined) {
      const midi = tone.pitch + midiOfZero + shift
      notes.push({ frequency: 440 * 2 ** ((midi - 69) / 12), start: at, length })
    }
    at += length
  }
  return { notes, duration: at }
}

/** The gain of a note `t` seconds into it: a quick swell, held, a short fall into the next. */
export function noteEnvelope(t: number, length: number): number {
  if (t < 0 || t >= length + fallTo) return 0
  if (t < attack) return t / attack
  if (t <= length - fallFrom) return 1
  return (length + fallTo - t) / (fallFrom + fallTo)
}

/**
 * A melody rendered to a mono 16-bit WAV, the same triangle tone the website
 * plays: the app has no oscillator to play notes live, so it plays a file.
 * The loop is kept to an add and a compare a sample, since Hermes interprets
 * it: a long Introit is a million samples.
 */
export function melodyWav(tones: Tone[], sampleRate = 16000): Uint8Array {
  const { notes, duration } = sungNotes(tones)
  const samples = Math.ceil((duration + 0.3) * sampleRate)
  const bytes = new Uint8Array(44 + samples * 2)
  writeHeader(new DataView(bytes.buffer), samples, sampleRate)
  // WAV is little-endian, as every phone the app runs on is.
  const pcm = new Int16Array(bytes.buffer, 44, samples)
  // As loud as the website's 0.22 gain: a guide, never a shout.
  const gain = 0.22 * 32767
  const edge = Math.ceil(attack * sampleRate)
  for (const { frequency, start, length } of notes) {
    const from = Math.floor(start * sampleRate)
    const to = Math.min(samples, Math.ceil((start + length + fallTo) * sampleRate))
    const fall = Math.floor((start + length - fallFrom) * sampleRate)
    // A triangle wave walked up and down by a fixed step, turning at ±1.
    const step = (4 * frequency) / sampleRate
    let value = -1
    let rising = true
    for (let i = from; i < to; i++) {
      const shaped =
        i - from < edge || i > fall ? value * noteEnvelope((i - from) / sampleRate, length) : value
      pcm[i] += shaped * gain
      value += rising ? step : -step
      if (value > 1) {
        value = 2 - value
        rising = false
      } else if (value < -1) {
        value = -2 - value
        rising = true
      }
    }
  }
  return bytes
}

function writeHeader(view: DataView, samples: number, sampleRate: number): void {
  const ascii = (at: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(at + i, text.charCodeAt(i))
  }
  ascii(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true) // the format chunk's size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // bytes a second
  view.setUint16(32, 2, true) // bytes a sample
  view.setUint16(34, 16, true) // bits a sample
  ascii(36, 'data')
  view.setUint32(40, samples * 2, true)
}
