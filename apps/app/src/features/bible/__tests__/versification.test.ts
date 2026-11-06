import { describe, expect, it } from 'vitest'

import { buildVersification } from '../versification'

// The shapes the Greek editions bring: the Septuagint's Jeremiah, where the
// oracles against the nations stand in the middle of the book, a verse only
// the Greek has, and two verses the Greek folds into one of the Vulgate's.
const septuagint = buildVersification({
  jeremias: {
    '32:1': '25:15',
    '32:2': '25:16',
    '25:15': '49:34',
    '26:2': null,
  },
  romans: {
    '14:24': '16:25',
    '14:25': '16:25',
  },
})

describe('toShared', () => {
  it('moves a verse the table names to its Vulgate address', () => {
    expect(septuagint.toShared({ bookId: 'jeremias', chapter: 32, verse: 1 })).toEqual({
      bookId: 'jeremias',
      chapter: 25,
      verse: 15,
    })
  })

  it('leaves a verse the table does not name where it is', () => {
    expect(septuagint.toShared({ bookId: 'jeremias', chapter: 1, verse: 5 })).toEqual({
      bookId: 'jeremias',
      chapter: 1,
      verse: 5,
    })
  })

  it('has no shared address for a verse the Vulgate lacks', () => {
    expect(septuagint.toShared({ bookId: 'jeremias', chapter: 26, verse: 2 })).toBeUndefined()
  })
})

describe('fromShared', () => {
  it('finds the edition verse a shared address was moved from', () => {
    expect(septuagint.fromShared({ bookId: 'jeremias', chapter: 25, verse: 15 })).toEqual({
      bookId: 'jeremias',
      chapter: 32,
      verse: 1,
    })
  })

  it('opens a shared verse two edition verses fold into at the first', () => {
    expect(septuagint.fromShared({ bookId: 'romans', chapter: 16, verse: 25 })).toEqual({
      bookId: 'romans',
      chapter: 14,
      verse: 24,
    })
  })

  it('finds nothing where the edition’s verse of that number is another one', () => {
    // Greek Jeremiah 25:15 is the Vulgate's 49:34; the Vulgate's 25:15 is at
    // Greek 32:1, but the Vulgate's 32:1 has no counterpart named in the table.
    expect(septuagint.fromShared({ bookId: 'jeremias', chapter: 32, verse: 1 })).toBeUndefined()
  })

  it('round-trips every verse the table moves', () => {
    for (const own of [
      { bookId: 'jeremias', chapter: 32, verse: 2 },
      { bookId: 'jeremias', chapter: 25, verse: 15 },
      { bookId: 'romans', chapter: 14, verse: 24 },
    ]) {
      const shared = septuagint.toShared(own)
      expect(shared && septuagint.fromShared(shared)).toEqual(own)
    }
  })
})
