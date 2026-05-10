import { describe, expect, it } from 'vitest'

import { toFirstLetter } from './notation'

describe('toFirstLetter', () => {
  it('reduces words to their first letter, preserving inter-word spacing', () => {
    expect(toFirstLetter('Sub tuum praesidium confugimus')).toBe('S t p c')
  })

  it('preserves trailing punctuation attached to a word', () => {
    expect(toFirstLetter('Sub tuum praesidium confugimus,')).toBe('S t p c,')
    expect(toFirstLetter('Sancta Dei Genetrix.')).toBe('S D G.')
  })

  it('preserves capitalization of the original first letter', () => {
    expect(toFirstLetter('Pater Noster, qui es in caelis')).toBe('P N, q e i c')
  })

  it('handles inline punctuation (commas, semicolons)', () => {
    expect(toFirstLetter('Hail, Mary, full of grace.')).toBe('H, M, f o g.')
  })

  it('emits only the leading letter for words with apostrophe contractions', () => {
    expect(toFirstLetter("don't worry")).toBe('d w')
    expect(toFirstLetter("d'agua fresca")).toBe('d f')
  })

  it('handles hyphens by treating each side as one token (the hyphen rides with first half)', () => {
    // "well-being" → "w-" because the hyphen is preserved as inline punctuation after first letter
    expect(toFirstLetter('well-being')).toBe('w-b')
  })

  it('returns empty string for empty input', () => {
    expect(toFirstLetter('')).toBe('')
    expect(toFirstLetter('   ')).toBe('')
  })

  it('preserves multiple lines as multiple lines', () => {
    expect(toFirstLetter('Sub tuum praesidium\nSancta Dei Genetrix')).toBe('S t p\nS D G')
  })

  it('handles all-caps words by preserving the capital', () => {
    expect(toFirstLetter('AMEN.')).toBe('A.')
  })

  it('matches the Sub Tuum example from the spec', () => {
    const input = [
      'Sub tuum praesidium confugimus,',
      'Sancta Dei Genetrix.',
      'Nostras deprecationes ne despicias in necessitatibus,',
      'sed a periculis cunctis libera nos semper, Virgo gloriosa et benedicta.',
    ].join('\n')
    const expected = ['S t p c,', 'S D G.', 'N d n d i n,', 's a p c l n s, V g e b.'].join('\n')
    expect(toFirstLetter(input)).toBe(expected)
  })
})
