import { describe, expect, it } from 'vitest'

import { composeCardKey, parseCardKey } from './cardKey'

describe('composeCardKey / parseCardKey', () => {
  it('round-trips a basic card key', () => {
    const key = composeCardKey('prayer/our-father', 'en-US', 0)
    expect(key).toBe('prayer/our-father|en-US|0')
    expect(parseCardKey(key)).toEqual({
      prayerId: 'prayer/our-father',
      language: 'en-US',
      portionIndex: 0,
    })
  })

  it('round-trips a portioned card key', () => {
    const key = composeCardKey('prayer/psalm-50', 'la', 3)
    expect(parseCardKey(key)).toEqual({
      prayerId: 'prayer/psalm-50',
      language: 'la',
      portionIndex: 3,
    })
  })

  it('handles language tags with hyphens', () => {
    const key = composeCardKey('prayer/ave-maria', 'pt-BR', 0)
    expect(parseCardKey(key)).toEqual({
      prayerId: 'prayer/ave-maria',
      language: 'pt-BR',
      portionIndex: 0,
    })
  })
})
