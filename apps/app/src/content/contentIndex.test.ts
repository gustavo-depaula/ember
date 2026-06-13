import { beforeEach, describe, expect, it } from 'vitest'

import {
  canonicalize,
  getAllEntries,
  getCatalogVersion,
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
    'practice/our-father': { kind: 'practice', hash: 'p-our-father', size: 100 },
    'practice/hail-mary': { kind: 'practice', hash: 'p-hail-mary', size: 100 },
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
    expect(getEntry('practice/our-father')?.kind).toBe('practice')
    expect(getEntry('does/not/exist')).toBeUndefined()
  })

  it('hasEntry reports membership in the catalog', () => {
    expect(hasEntry('practice/rosary')).toBe(true)
    expect(hasEntry('practice/synthetic')).toBe(false)
  })

  it('canonicalize prepends a kind prefix when missing', () => {
    expect(canonicalize('practice/rosary')).toBe('practice/rosary')
    expect(canonicalize('rosary', 'practice')).toBe('practice/rosary')
    expect(canonicalize('our-father')).toBe('practice/our-father')
    expect(canonicalize('totally-fake')).toBeUndefined()
  })

  it('canonicalize with hintKind is a HARD filter — no fallthrough to other kinds', () => {
    // 'marian' exists as a collection; caller asks for a practice. Returning
    // collection/marian here would let a wrongly-typed manifest leak through
    // to the engine and crash on its missing fields.
    expect(canonicalize('marian', 'practice')).toBeUndefined()
    expect(canonicalize('rosary', 'collection')).toBeUndefined()
  })

  it('getEntriesByKind only returns matching kind', () => {
    const practices = getEntriesByKind('practice').map(([id]) => id)
    expect(practices).toContain('practice/our-father')
    expect(practices).toContain('practice/hail-mary')
    expect(practices).toContain('practice/rosary')
    expect(practices).not.toContain('collection/marian')
  })

  it('getAllEntries returns every catalog entry', () => {
    const all = getAllEntries()
    expect(all.has('practice/our-father')).toBe(true)
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
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [
            { kind: 'item', ref: 'practice/rosary' },
            { kind: 'item', ref: 'practice/hail-mary' },
          ],
        },
      ],
    } satisfies CollectionItemManifest)

    const items = getCollectionItems('collection/marian')
    expect(items.map((i) => i.ref)).toEqual(['practice/rosary', 'practice/hail-mary'])
    expect(items[0].entry?.kind).toBe('practice')
  })

  it('getCollectionsForItem reverse-indexes membership', () => {
    rememberManifestBody('c-marian', {
      id: 'collection/marian',
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [
            { kind: 'item', ref: 'practice/rosary' },
            { kind: 'item', ref: 'practice/hail-mary' },
          ],
        },
      ],
    } satisfies CollectionItemManifest)
    rememberManifestBody('c-essentials', {
      id: 'collection/essentials',
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [
            { kind: 'item', ref: 'practice/rosary' },
            { kind: 'item', ref: 'practice/morning-offering' },
          ],
        },
      ],
    } satisfies CollectionItemManifest)

    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary').sort()).toEqual([
      'collection/essentials',
      'collection/marian',
    ])
    expect(getCollectionsForItem('practice/morning-offering')).toEqual(['collection/essentials'])
    expect(getCollectionsForItem('practice/hail-mary')).toEqual(['collection/marian'])
    expect(getCollectionsForItem('practice/our-father')).toEqual([])
  })

  it('setCatalog skips identical catalogs (same generated) — no version bump', () => {
    // The background refresh re-fetches catalog.json on every launch; an
    // unchanged catalog must not re-render every useCatalogVersion subscriber.
    const before = getCatalogVersion()
    expect(setCatalog(baseCatalog())).toBe(false)
    expect(getCatalogVersion()).toBe(before)
  })

  it('setCatalog applies a catalog with a different generated timestamp', () => {
    const before = getCatalogVersion()
    const next = baseCatalog()
    next.generated = '2026-05-09T00:00:00Z'
    expect(setCatalog(next)).toBe(true)
    expect(getCatalogVersion()).toBe(before + 1)
  })

  it('setCatalog never skips when generated is empty (test/reset semantics)', () => {
    const empty = { ...baseCatalog(), generated: '' }
    const before = getCatalogVersion()
    expect(setCatalog(empty)).toBe(true)
    expect(setCatalog({ ...empty })).toBe(true)
    expect(getCatalogVersion()).toBe(before + 2)
  })

  it('reverse index is invalidated when collections change', () => {
    rememberManifestBody('c-marian', {
      id: 'collection/marian',
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [{ kind: 'item', ref: 'practice/rosary' }],
        },
      ],
    } satisfies CollectionItemManifest)
    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary')).toEqual(['collection/marian'])

    rememberManifestBody('c-essentials', {
      id: 'collection/essentials',
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [{ kind: 'item', ref: 'practice/rosary' }],
        },
      ],
    } satisfies CollectionItemManifest)
    invalidateMemberOfIndex()

    expect(getCollectionsForItem('practice/rosary').sort()).toEqual([
      'collection/essentials',
      'collection/marian',
    ])
  })
})
