import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n', () => ({
  localizeContent: (text: Record<string, string>) => text['en-US'] ?? Object.values(text)[0],
}))
vi.mock('@/content/resolver', () => ({
  getAllManifests: () => [
    {
      id: 'practice/rosary',
      name: { 'en-US': 'Holy Rosary' },
      tags: ['Marian'],
      description: { 'en-US': 'Twenty mysteries of the life of Christ.' },
    },
    {
      id: 'practice/rosary-novena',
      name: { 'en-US': '54-Day Rosary Novena' },
    },
    { id: 'practice/mental-prayer-teresian', name: { 'en-US': 'Mental Prayer — Teresian Method' } },
    { id: 'practice/mental-prayer', name: { 'en-US': 'Mental Prayer' } },
    {
      id: 'practice/confession',
      name: { 'en-US': 'Confession' },
      description: { 'en-US': 'The sacramental forgiveness of sins.' },
    },
    {
      id: 'practice/visit',
      name: { 'en-US': 'Visit to the Blessed Sacrament' },
      description: { 'en-US': 'At a different hour from the mental prayer.' },
    },
    {
      id: 'practice/angelus',
      name: { 'en-US': 'Angelus' },
      tags: ['Mariánico'],
      description: { 'en-US': 'The Incarnation, thrice daily.' },
    },
    { id: 'practice/sao-jose', name: { 'en-US': 'Novena a São José' } },
    {
      id: 'practice/soul-of-christ',
      name: { 'en-US': 'Soul of Christ', 'pt-BR': 'Alma de Cristo', la: 'Anima Christi' },
      search: { lines: { 'en-US': ['Soul of Christ, sanctify me.'] } },
    },
    {
      id: 'practice/three-children',
      name: { 'en-US': 'Canticle of the Three Children' },
      search: {
        keywords: {
          'en-US': ['Thanksgiving after Holy Mass'],
          'pt-BR': ['Ação de Graças após a Santa Missa'],
        },
        lines: { 'en-US': ['Bless the Lord, all you works of the Lord'] },
      },
    },
    {
      id: 'practice/thursday',
      name: { 'en-US': 'Thursday — The Holy Eucharist' },
      description: { 'en-US': 'A Spiritual Communion and the Anima Christi.' },
    },
  ],
  isAlternateForm: () => false,
}))
vi.mock('@/content/contentIndex', () => ({
  getEntriesByKind: (kind: string) => {
    if (kind === 'collection')
      return [
        ['collection/marian', { name: { 'en-US': 'Marian Devotions' } }],
        ['collection/eucharist', { name: { 'en-US': 'The Eucharist' } }],
      ]
    if (kind === 'book')
      return [
        ['book/secret', { hash: 'h1' }],
        ['book/no-name', { hash: 'h2' }],
      ]
    return []
  },
  getRememberedManifest: (hash: string) =>
    hash === 'h1'
      ? {
          name: { 'en-US': 'The Secret of the Rosary' },
          author: { 'en-US': 'St. Louis de Montfort' },
        }
      : undefined,
}))

import { buildSearchIndex, searchIndex } from '../searchCatalog'

const index = buildSearchIndex()
const ids = (query: string) =>
  searchIndex(index, query).map((hit) => `${hit.result.kind}:${hit.result.id}`)
const hits = (query: string) =>
  searchIndex(index, query).map((hit) => [hit.group, hit.result.id, hit.caption])

describe('searchCatalog', () => {
  it('groups practices, then collections, then books, best match first', () => {
    expect(ids('rosary')).toEqual([
      'practice:practice/rosary',
      'practice:practice/rosary-novena',
      'book:secret',
    ])
    // A prefix outranks a substring.
    expect(ids('novena')).toEqual(['practice:practice/sao-jose', 'practice:practice/rosary-novena'])
  })

  it('folds case and accents on both sides', () => {
    expect(ids('sao jose')).toEqual(['practice:practice/sao-jose'])
    expect(ids('MARIANICO')).toEqual(['practice:practice/angelus'])
  })

  it('matches practice tags and descriptions, collections, and book authors', () => {
    // The collection is named for the query; the practices only carry its tag.
    expect(ids('marian')).toEqual([
      'collection:marian',
      'practice:practice/angelus',
      'practice:practice/rosary',
    ])
    expect(ids('incarnation')).toEqual(['practice:practice/angelus'])
    expect(ids('montfort')).toEqual(['book:secret'])
    expect(searchIndex(index, 'montfort')[0].result).toMatchObject({
      subtitle: 'St. Louis de Montfort',
    })
  })

  it('matches words, not fragments, and ranks the closer title first', () => {
    expect(ids('mental')).toEqual([
      'practice:practice/mental-prayer',
      'practice:practice/mental-prayer-teresian',
      'practice:practice/visit',
    ])
    expect(ids('Mental  p')).toEqual([
      'practice:practice/mental-prayer',
      'practice:practice/mental-prayer-teresian',
      'practice:practice/visit',
    ])
    expect(ids('teresian')).toEqual(['practice:practice/mental-prayer-teresian'])
  })

  it('finds a prayer by its name in another language, above one that only mentions it', () => {
    expect(hits('Anima christi')).toEqual([
      ['practice', 'practice/soul-of-christ', 'Anima Christi'],
      ['mentioned', 'practice/thursday', undefined],
    ])
    expect(hits('alma de cristo')[0]).toEqual([
      'practice',
      'practice/soul-of-christ',
      'Alma de Cristo',
    ])
    expect(hits('soul of christ')[0]).toEqual(['practice', 'practice/soul-of-christ', undefined])
  })

  it('finds a prayer by the heading it is filed under, in either language', () => {
    expect(hits('thanksgiving after mass')).toEqual([
      ['practice', 'practice/three-children', 'Thanksgiving after Holy Mass'],
    ])
    // Recalled with other small words than the heading's own.
    expect(ids('ação de graças depois da missa')).toEqual(['practice:practice/three-children'])
    expect(hits('acao de gracas')).toEqual([
      ['practice', 'practice/three-children', 'Ação de Graças após a Santa Missa'],
    ])
  })

  it('finds a prayer by its opening line, never by words from two lines', () => {
    expect(hits('bless the lord')).toEqual([
      ['practice', 'practice/three-children', 'Bless the Lord, all you works of the Lord'],
    ])
    expect(ids('sanctify works')).toEqual([])
  })

  it('lifts a sure match above the weaker matches of an earlier kind', () => {
    expect(hits('the eucharist')).toEqual([
      ['top', 'eucharist', undefined],
      ['practice', 'practice/thursday', undefined],
    ])
    // Already first: no heading of its own.
    expect(hits('rosary')[0][0]).toBe('practice')
  })

  it('forgives a typo in a title', () => {
    expect(ids('rozary')).toContain('practice:practice/rosary')
  })

  it('returns nothing for a blank query and skips books without a name', () => {
    expect(ids('   ')).toEqual([])
    expect(index.some((e) => e.result.id === 'no-name')).toBe(false)
  })
})
