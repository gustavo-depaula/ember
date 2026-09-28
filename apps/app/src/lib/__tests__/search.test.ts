import { describe, expect, it } from 'vitest'

import { matchWords, normalizeForSearch, searchWords } from '../search'

describe('normalizeForSearch', () => {
  it('folds diacritics and case, and collapses whitespace', () => {
    expect(normalizeForSearch('Santo Rosário')).toBe('santo rosario')
    expect(normalizeForSearch('  Misericórdia ')).toBe('misericordia')
    expect(normalizeForSearch('Mental  p')).toBe('mental p')
  })
})

describe('searchWords', () => {
  it('splits on punctuation and dashes', () => {
    expect(searchWords('mental prayer — teresian method')).toEqual([
      'mental',
      'prayer',
      'teresian',
      'method',
    ])
    expect(searchWords("st. alphonsus' daily-meditations")).toEqual([
      'st',
      'alphonsus',
      'daily',
      'meditations',
    ])
  })
})

describe('matchWords', () => {
  const w = (text: string) => searchWords(normalizeForSearch(text))

  it('matches whole words and the word being typed', () => {
    expect(matchWords(w('Mental Prayer'), w('mental prayer'))).toBe('exact')
    expect(matchWords(w('Mental Prayer'), w('mental p'))).toBe('prefix')
    expect(matchWords(w('Oração a São José'), w('jose sao'))).toBe('exact')
    expect(matchWords(w('Terço da Divina Misericórdia'), w('miseric'))).toBe('prefix')
  })

  it('never matches inside a word', () => {
    expect(matchWords(w('the sacramental presence'), w('mental'))).toBeUndefined()
  })

  it('forgives a typo in longer tokens only', () => {
    expect(matchWords(w('Santo Rosário'), w('rozario'))).toBe('typo')
    expect(matchWords(w('Catecismo'), w('catacismo'))).toBe('typo')
    expect(matchWords(w('Santo Rosário'), w('rozar'))).toBe('typo')
    expect(matchWords(w('Santo Rosário'), w('rozario'), { typos: false })).toBeUndefined()
    // One edit away from "—" or "a" is not a match for a single letter.
    expect(matchWords(w('Mental Prayer — Teresian Method'), w('mental x'))).toBeUndefined()
  })

  it('needs every token', () => {
    expect(matchWords(w('Santo Rosário'), w('rosario eucaristia'))).toBeUndefined()
    expect(matchWords(w('Santo Rosário'), [])).toBeUndefined()
  })
})
