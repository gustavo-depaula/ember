import { beforeEach, describe, expect, it } from 'vitest'

import { rememberManifestBody, resetContentIndex, setCatalog } from '@/content/contentIndex'
import type { CollectionItemManifest } from '@/content/manifestTypes'

import { computePlanCoverage } from './coverage'

beforeEach(() => {
  resetContentIndex()
})

describe('computePlanCoverage', () => {
  it('returns zero when there is no plan', () => {
    const result = computePlanCoverage([], [{ id: 'practice/rosary' }])
    expect(result).toEqual({ total: 0, covered: 0 })
  })

  it('counts directly pinned practices', () => {
    const result = computePlanCoverage(
      ['rosary', 'lauds'],
      [{ id: 'practice/rosary' }, { id: 'book/foo' }],
    )
    expect(result).toEqual({ total: 2, covered: 1 })
  })

  it('credits practices reached via a pinned collection', () => {
    setCatalog({
      version: 2,
      generated: '',
      items: {
        'collection/marian': { kind: 'collection', hash: 'col-marian', size: 50 },
      },
    })
    rememberManifestBody('col-marian', {
      id: 'collection/marian',
      sections: [
        {
          id: 'all',
          title: { 'en-US': 'All' },
          blocks: [
            { kind: 'item', ref: 'practice/rosary' },
            { kind: 'item', ref: 'practice/angelus' },
          ],
        },
      ],
    } satisfies CollectionItemManifest)

    const result = computePlanCoverage(
      ['rosary', 'angelus', 'lauds'],
      [{ id: 'collection/marian' }],
    )
    expect(result).toEqual({ total: 3, covered: 2 })
  })

  it('de-duplicates plan ids before counting', () => {
    const result = computePlanCoverage(['rosary', 'rosary', 'lauds'], [{ id: 'practice/rosary' }])
    expect(result).toEqual({ total: 2, covered: 1 })
  })
})
