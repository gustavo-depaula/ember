import { describe, expect, it } from 'vitest'

import { citationsForVerse, passageLabel } from '../citations'

describe('citationsForVerse', () => {
  const passages = [
    { from: 1, to: 18, passage: '1,1-18', ccc: [241, 291] },
    { from: 14, to: 14, passage: '1,14', ccc: [461] },
    { from: 19, to: 999, passage: '1,19-2,5', ccc: [] },
  ]

  it('finds the passage a verse belongs to, the shortest where two overlap', () => {
    expect(citationsForVerse(passages, 3)?.passage).toBe('1,1-18')
    expect(citationsForVerse(passages, 14)?.passage).toBe('1,14')
  })

  it('takes a passage that runs into the next chapter to the end of this one', () => {
    expect(citationsForVerse(passages, 51)?.passage).toBe('1,19-2,5')
    expect(citationsForVerse([passages[0]], 19)).toBeUndefined()
  })
})

describe('passageLabel', () => {
  it('writes the reference the way the reader writes verses', () => {
    expect(passageLabel('1,1-18')).toBe('1:1–18')
    expect(passageLabel('2,23-3,15')).toBe('2:23–3:15')
    expect(passageLabel('19,5')).toBe('19:5')
  })
})
