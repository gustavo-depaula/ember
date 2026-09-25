import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/content/manifestTypes'
import { bookCoverFormat, bookCoverFormats, coverFor } from '../coverFor'

const entry = (e: Partial<CatalogEntry>): CatalogEntry => ({
  kind: 'practice',
  hash: 'h',
  size: 1,
  ...e,
})

describe('bookCoverFormat', () => {
  it('uses the format the manifest names', () => {
    expect(bookCoverFormat('book/x', 'gilt')).toBe('gilt')
  })

  it('falls back to a stable pick when the name is missing or unknown', () => {
    const a = bookCoverFormat('book/some-book', undefined)
    expect(bookCoverFormats).toContain(a)
    expect(bookCoverFormat('book/some-book', 'leopard-print')).toBe(a)
  })

  it('spreads the fallback across formats rather than pinning one', () => {
    const picks = new Set(
      Array.from({ length: 64 }, (_, i) => bookCoverFormat(`book/b${i}`, undefined)),
    )
    expect(picks.size).toBeGreaterThan(4)
  })
})

describe('coverFor', () => {
  it('draws books as bound volumes with their author', () => {
    const cover = coverFor(
      'book/a',
      entry({ kind: 'book', cover: 'missal', author: { 'en-US': 'Kempis' } }),
    )
    expect(cover).toEqual({ kind: 'book', format: 'missal', author: 'Kempis' })
  })

  it('draws practices as colored holy cards with their minutes', () => {
    const cover = coverFor('practice/rosary', entry({ icon: 'rosary', estimatedMinutes: 20 }))
    expect(cover).toEqual({ kind: 'practice', icon: 'rosary', minutes: 20 })
  })

  it('draws prayers as cream holy cards, liturgical ones as breviary pages', () => {
    expect(coverFor('practice/memorare', entry({ form: 'prayer', icon: 'mary' }))).toEqual({
      kind: 'prayer',
      icon: 'mary',
    })
    expect(coverFor('practice/te-deum', entry({ form: 'prayer', liturgical: true }))).toEqual({
      kind: 'breviary',
    })
  })

  it('leaves other kinds to the versal', () => {
    expect(coverFor('collection/marian', entry({ kind: 'collection' }))).toBeUndefined()
  })
})
