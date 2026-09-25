import { describe, expect, it } from 'vitest'

import type { CatalogEntry } from '@/content/manifestTypes'
import { bookCoverFormat, collectionCoverStyle, coverFor } from '../coverFor'

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

  it('draws collections as the object their manifest names, counting what they hold', () => {
    const cover = coverFor(
      entry({ kind: 'collection', cover: 'boxed', itemCounts: { book: 48, practice: 2 } }),
    )
    expect(cover).toEqual({ kind: 'collection', style: 'boxed', volumes: 48, prayers: 2 })
  })

  it('draws chapters as tracts with subtitle and reading time', () => {
    const cover = coverFor(
      entry({ kind: 'chapter', subtitle: { 'en-US': 'On dryness' }, estimatedMinutes: 10 }),
    )
    expect(cover).toEqual({ kind: 'article', subtitle: 'On dryness', minutes: 10 })
  })

  it('leaves other kinds to the versal', () => {
    expect(coverFor(entry({ kind: 'creator' }))).toBeUndefined()
  })
})

describe('collectionCoverStyle', () => {
  it('gathers unnamed or unknown collections into a packet', () => {
    expect(collectionCoverStyle('ordo')).toBe('ordo')
    expect(collectionCoverStyle(undefined)).toBe('packet')
    expect(collectionCoverStyle('crate')).toBe('packet')
  })
})
