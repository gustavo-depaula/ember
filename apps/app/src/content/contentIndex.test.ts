import { beforeEach, describe, expect, it } from 'vitest'

import {
  canonicalize,
  getAllEntries,
  getCollectionItems,
  getCollectionsForItem,
  getEntriesByKind,
  getEntry,
  hasEntry,
  invalidateMemberOfIndex,
  rememberManifestBody,
  resetContentIndex,
  search,
  setCatalog,
} from './contentIndex'
import type { Catalog, CollectionItemManifest } from './manifestTypes'

const baseCatalog = (): Catalog => ({
  version: 2,
  generated: '2026-05-08T00:00:00Z',
  items: {
    'prayer/our-father': { kind: 'prayer', hash: 'p-our-father', size: 100 },
    'prayer/hail-mary': { kind: 'prayer', hash: 'p-hail-mary', size: 100 },
    'practice/rosary': {
      kind: 'practice',
      hash: 'p-rosary',
      size: 200,
      name: { 'en-US': 'Rosary' },
      tags: ['marian'],
    },
    'practice/morning-offering': {
      kind: 'practice',
      hash: 'p-mo',
      size: 200,
      name: { 'en-US': 'Morning Offering' },
    },
    'collection/marian': {
      kind: 'collection',
      hash: 'c-marian',
      size: 50,
      name: { 'en-US': 'Marian' },
      tags: ['marian'],
    },
    'collection/essentials': {
      kind: 'collection',
      hash: 'c-essentials',
      size: 50,
      name: { 'en-US': 'Essentials' },
    },
  },
})

beforeEach(() => {
  resetContentIndex()
  setCatalog(baseCatalog())
})

describe('contentIndex', () => {
  it('returns entries by id', () => {
    expect(getEntry('practice/rosary')?.kind).toBe('practice')
    expect(getEntry('prayer/our-father')?.kind).toBe('prayer')
    expect(getEntry('does/not/exist')).toBeUndefined()
  })

  it('hasEntry reports membership in the catalog', () => {
    expect(hasEntry('practice/rosary')).toBe(true)
    expect(hasEntry('prayer/synthetic')).toBe(false)
  })

  it('canonicalize prepends a kind prefix when missing', () => {
    expect(canonicalize('practice/rosary')).toBe('practice/rosary')
    expect(canonicalize('rosary', 'practice')).toBe('practice/rosary')
    // No hint and not in any default kind
    expect(canonicalize('our-father')).toBe('prayer/our-father')
    expect(canonicalize('totally-fake')).toBeUndefined()
  })

  it('canonicalize with hintKind is a HARD filter — no fallthrough to other kinds', () => {
    // 'our-father' exists as a prayer, but the caller asked for a practice.
    // Returning prayer/our-father here would let a wrongly-typed manifest leak
    // through to the engine and crash on its missing fields.
    expect(canonicalize('our-father', 'practice')).toBeUndefined()
    expect(canonicalize('rosary', 'prayer')).toBeUndefined()
  })

  it('getEntriesByKind only returns matching kind', () => {
    const prayers = getEntriesByKind('prayer').map(([id]) => id)
    expect(prayers).toContain('prayer/our-father')
    expect(prayers).toContain('prayer/hail-mary')
    expect(prayers).not.toContain('practice/rosary')
  })

  it('getAllEntries returns every catalog entry', () => {
    const all = getAllEntries()
    expect(all.has('prayer/our-father')).toBe(true)
    expect(all.has('practice/rosary')).toBe(true)
    expect(all.has('collection/marian')).toBe(true)
  })

  it('search matches localized names + tags', () => {
    const results = search('rosary')
    expect(results.some((e) => e.kind === 'practice')).toBe(true)

    const tagResults = search('marian')
    // Both the practice (tag) and collection (name + tag) should match
    expect(tagResults.length).toBeGreaterThanOrEqual(2)

    expect(search('rosary', 'collection')).toEqual([])
  })

  it('getCollectionItems returns refs from a resident collection manifest', () => {
    rememberManifestBody('c-marian', {
      id: 'collection/marian',
      items: [{ ref: 'practice/rosary' }, { ref: 'prayer/hail-mary' }],
    } satisfies CollectionItemManifest)

    const items = getCollectionItems('collection/marian')
    expect(items.map((i) => i.ref)).toEqual(['practice/rosary', 'prayer/hail-mary'])
    expect(items[0].entry?.kind).toBe('practice')
  })

  it('getCollectionsForItem reverse-indexes membership', () => {
    rememberManifestBody('c-marian', {
      id: 'collection/marian',
      items: [{ ref: 'practice/rosary' }, { ref: 'prayer/hail-mary' }],
    } satisfies CollectionItemManifest)
    rememberManifestBody('c-essentials', {
      id: 'collection/essentials',
      items: [{ ref: 'practice/rosary' }, { ref: 'practice/morning-offering' }],
    } satisfies CollectionItemManifest)

    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary').sort()).toEqual([
      'collection/essentials',
      'collection/marian',
    ])
    expect(getCollectionsForItem('practice/morning-offering')).toEqual(['collection/essentials'])
    expect(getCollectionsForItem('prayer/hail-mary')).toEqual(['collection/marian'])
    expect(getCollectionsForItem('prayer/our-father')).toEqual([])
  })

  it('reverse index is invalidated when collections change', () => {
    rememberManifestBody('c-marian', {
      id: 'collection/marian',
      items: [{ ref: 'practice/rosary' }],
    } satisfies CollectionItemManifest)
    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary')).toEqual(['collection/marian'])

    rememberManifestBody('c-essentials', {
      id: 'collection/essentials',
      items: [{ ref: 'practice/rosary' }],
    } satisfies CollectionItemManifest)
    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary').sort()).toEqual([
      'collection/essentials',
      'collection/marian',
    ])
  })
})
