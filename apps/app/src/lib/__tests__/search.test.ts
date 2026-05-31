import { describe, expect, it } from 'vitest'

import { fuzzyScore, normalizeForSearch } from '../search'

describe('normalizeForSearch', () => {
  it('folds diacritics and case', () => {
    expect(normalizeForSearch('Santo Rosário')).toBe('santo rosario')
    expect(normalizeForSearch('São José')).toBe('sao jose')
    expect(normalizeForSearch('  Misericórdia ')).toBe('misericordia')
  })
})

describe('fuzzyScore', () => {
  const q = normalizeForSearch

  it('matches across missing accents', () => {
    expect(fuzzyScore('Santo Rosário', q('rosario'))).toBeGreaterThan(0)
    expect(fuzzyScore('Oração a São José', q('sao jose'))).toBeGreaterThan(0)
    expect(fuzzyScore('Terço da Divina Misericórdia', q('miseric'))).toBeGreaterThan(0)
  })

  it('tolerates a one-character typo', () => {
    expect(fuzzyScore('Santo Rosário', q('rozario'))).toBeGreaterThan(0)
    expect(fuzzyScore('Catecismo', q('catacismo'))).toBeGreaterThan(0)
  })

  it('ranks exact/prefix above substring above typo', () => {
    expect(fuzzyScore('Rosário', q('rosario'))).toBe(100)
    expect(fuzzyScore('Santo Rosário', q('santo'))).toBe(80)
    expect(fuzzyScore('Santo Rosário', q('rosario'))).toBe(60)
    expect(fuzzyScore('Rosário', q('rozari'))).toBe(40)
  })

  it('rejects unrelated text and empty queries', () => {
    expect(fuzzyScore('Santo Rosário', q('eucaristia'))).toBe(0)
    expect(fuzzyScore('Santo Rosário', '')).toBe(0)
    expect(fuzzyScore(undefined, q('rosario'))).toBe(0)
  })
})
