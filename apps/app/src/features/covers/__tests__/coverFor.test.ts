import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/content/manifestTypes'
import { bookCoverFormat, coverFor } from '../coverFor'

const entry = (e: Partial<CatalogEntry>): CatalogEntry => ({
  kind: 'practice',
  hash: 'h',
  size: 1,
  ...e,
})

describe('bookCoverFormat', () => {
  it('uses the format the manifest names', () => {
    expect(bookCoverFormat('gilt')).toBe('gilt')
  })

  it('binds unnamed or unknown covers as Classic', () => {
    expect(bookCoverFormat(undefined)).toBe('classic')
    expect(bookCoverFormat('leopard-print')).toBe('classic')
  })
})

describe('coverFor', () => {
  it('draws books as bound volumes with their author', () => {
    const cover = coverFor(entry({ kind: 'book', cover: 'missal', author: { 'en-US': 'Kempis' } }))
    expect(cover).toEqual({ kind: 'book', format: 'missal', author: 'Kempis' })
  })

  it('draws practices as colored holy cards with their minutes', () => {
    const cover = coverFor(entry({ icon: 'rosary', estimatedMinutes: 20 }))
    expect(cover).toEqual({ kind: 'practice', icon: 'rosary', minutes: 20 })
  })

  it('draws prayers as cream holy cards, liturgical ones as breviary pages', () => {
    expect(coverFor(entry({ form: 'prayer', icon: 'mary' }))).toEqual({
      kind: 'prayer',
      icon: 'mary',
    })
    expect(coverFor(entry({ form: 'prayer', liturgical: true }))).toEqual({
      kind: 'breviary',
    })
  })

  it('leaves other kinds to the versal', () => {
    expect(coverFor(entry({ kind: 'collection' }))).toBeUndefined()
  })
})
