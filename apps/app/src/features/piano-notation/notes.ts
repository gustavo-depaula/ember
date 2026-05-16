export type Clef = 'treble' | 'bass'
export type Accidental = '' | '#' | 'b'
export type AccidentalPref = '#' | 'b'

export const PT_NATURAL_NAMES = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'] as const

export const SHARP_GLYPH = '♯'
export const FLAT_GLYPH = '♭'
export const NATURAL_GLYPH = '♮'

// step encodes diatonic position: step = octave * 7 + letterIdx, where
// letterIdx is C=0, D=1, E=2, F=3, G=4, A=5, B=6. step 28 = C4 (middle C).
// Pairing a step with an Accidental fully determines both pitch and how the
// note should be drawn on the staff (which line/space + which glyph).

// Bottom-line anchor step for each clef (treble bottom = E4, bass bottom = G2).
export const TREBLE_ANCHOR_STEP = 30
export const BASS_ANCHOR_STEP = 18

// Piano range C2..C6 (MIDI 36..84) maps to diatonic steps 14..42.
export const MIN_STEP = 14
export const MAX_STEP = 42
export const PIANO_MIN_MIDI = 36
export const PIANO_MAX_MIDI = 84

const NATURAL_LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11]
// Pitch-class → natural letter index, or -1 for the 5 black-key classes
const PC_TO_NATURAL_LETTER = [0, -1, 1, -1, 2, 3, -1, 4, -1, 5, -1, 6]
// For black-key spellings: pitch-class → adjacent natural letter index
const PC_TO_LETTER_SHARP_SPELLING = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
const PC_TO_LETTER_FLAT_SPELLING = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function stepToMidi(step: number, accidental: Accidental = ''): number {
  const letterIdx = mod(step, 7)
  const octave = Math.floor(step / 7)
  const base = (octave + 1) * 12 + NATURAL_LETTER_SEMITONES[letterIdx]
  if (accidental === '#') return base + 1
  if (accidental === 'b') return base - 1
  return base
}

export function midiToStep(
  midi: number,
  accidentalPref: AccidentalPref,
): { step: number; accidental: Accidental } {
  const pc = mod(midi, 12)
  const octave = Math.floor(midi / 12) - 1
  const naturalLetter = PC_TO_NATURAL_LETTER[pc]
  if (naturalLetter >= 0) {
    return { step: octave * 7 + naturalLetter, accidental: '' }
  }
  if (accidentalPref === '#') {
    return { step: octave * 7 + PC_TO_LETTER_SHARP_SPELLING[pc], accidental: '#' }
  }
  return { step: octave * 7 + PC_TO_LETTER_FLAT_SPELLING[pc], accidental: 'b' }
}

export function accidentalToGlyph(accidental: Accidental): string {
  if (accidental === '#') return SHARP_GLYPH
  if (accidental === 'b') return FLAT_GLYPH
  return ''
}

export function getNoteName(
  step: number,
  accidental: Accidental,
): { letter: string; suffix: string; octave: number } {
  const letterIdx = mod(step, 7)
  const octave = Math.floor(step / 7)
  return {
    letter: PT_NATURAL_NAMES[letterIdx],
    suffix: accidentalToGlyph(accidental),
    octave,
  }
}

function clefAnchor(clef: Clef): number {
  return clef === 'treble' ? TREBLE_ANCHOR_STEP : BASS_ANCHOR_STEP
}

export function stepToY(step: number, clef: Clef, staffBottomY: number, stepGap: number): number {
  return staffBottomY - (step - clefAnchor(clef)) * stepGap
}

// Ledger lines: every other step (the line steps) between the staff and the note.
// Returns the step indices that need a ledger line for a note sitting on `step`.
export function ledgerSteps(step: number, clef: Clef): number[] {
  const bottom = clefAnchor(clef)
  const top = bottom + 8
  if (step >= bottom && step <= top) return []
  const lines: number[] = []
  if (step < bottom) {
    const start = mod(step, 2) === mod(bottom, 2) ? step : step + 1
    for (let s = start; s < bottom; s += 2) lines.push(s)
  } else {
    const start = mod(step, 2) === mod(top, 2) ? step : step - 1
    for (let s = start; s > top; s -= 2) lines.push(s)
  }
  return lines
}

export function isBlackKey(midi: number): boolean {
  return PC_TO_NATURAL_LETTER[mod(midi, 12)] < 0
}

export type ChordNote = { step: number; accidental: Accidental }

export function chordNoteMidi(note: ChordNote): number {
  return stepToMidi(note.step, note.accidental)
}

// Pitch-class → Portuguese letter name with accidental glyph, spelled per
// the caller's preference for black keys (used for chord-root labels).
function pcToPortugueseName(pc: number, pref: AccidentalPref): string {
  const natural = PC_TO_NATURAL_LETTER[pc]
  if (natural >= 0) return PT_NATURAL_NAMES[natural]
  if (pref === 'b') return PT_NATURAL_NAMES[PC_TO_LETTER_FLAT_SPELLING[pc]] + FLAT_GLYPH
  return PT_NATURAL_NAMES[PC_TO_LETTER_SHARP_SPELLING[pc]] + SHARP_GLYPH
}

// Sorted-semitone-interval signature → quality label.
const CHORD_PATTERNS: Record<string, string> = {
  '0,4,7': 'maior',
  '0,3,7': 'menor',
  '0,3,6': 'dim',
  '0,4,8': 'aum',
  '0,5,7': 'sus4',
  '0,2,7': 'sus2',
  '0,4,7,10': '7',
  '0,4,7,11': '7M',
  '0,3,7,10': 'm7',
  '0,3,7,11': 'm7M',
  '0,3,6,10': 'm7♭5',
  '0,3,6,9': '°7',
  '0,4,7,9': '6',
  '0,3,7,9': 'm6',
}

// Try to identify a chord from its set of MIDI pitches. Returns the spelled
// root + quality (e.g. "Dó maior") or null if the pitch-class set doesn't
// match any known pattern. Prefers the lowest played note as root to keep
// the labelling intuitive — inversions are not currently detected.
export function identifyChord(midis: number[], pref: AccidentalPref = '#'): string | null {
  if (midis.length < 2) return null
  const pcs = Array.from(new Set(midis.map((m) => mod(m, 12)))).sort((a, b) => a - b)
  if (pcs.length < 2) return null
  const lowestPc = mod(Math.min(...midis), 12)
  // Put the lowest played pitch class first in the rotation order so it wins
  // ties — covers root-position triads cleanly.
  const rotations = [lowestPc, ...pcs.filter((pc) => pc !== lowestPc)]
  for (const root of rotations) {
    const intervals = pcs.map((pc) => mod(pc - root, 12)).sort((a, b) => a - b)
    const quality = CHORD_PATTERNS[intervals.join(',')]
    if (quality) return `${pcToPortugueseName(root, pref)} ${quality}`
  }
  return null
}
