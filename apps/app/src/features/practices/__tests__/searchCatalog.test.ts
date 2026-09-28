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
  ],
}))
vi.mock('@/content/contentIndex', () => ({
  getEntriesByKind: (kind: string) => {
    if (kind === 'collection')
      return [['collection/marian', { name: { 'en-US': 'Marian Devotions' } }]]
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
const ids = (query: string) => searchIndex(index, query).map((r) => `${r.kind}:${r.id}`)

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
    expect(ids('marian')).toEqual([
      'practice:practice/angelus',
      'practice:practice/rosary',
      'collection:marian',
    ])
    expect(ids('incarnation')).toEqual(['practice:practice/angelus'])
    expect(ids('montfort')).toEqual(['book:secret'])
    expect(searchIndex(index, 'montfort')[0]).toMatchObject({ subtitle: 'St. Louis de Montfort' })
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

  it('forgives a typo in a title', () => {
    expect(ids('rozary')).toContain('practice:practice/rosary')
  })

  it('returns nothing for a blank query and skips books without a name', () => {
    expect(ids('   ')).toEqual([])
    expect(index.some((e) => e.result.id === 'no-name')).toBe(false)
  })
})
