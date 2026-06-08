import { describe, expect, it } from 'vitest'
import { stripHtml } from '@/lib/html'
import type { TocLeaf } from '../bookContent'
import { type BookSearchIndex, stemToken, TOKEN_RE } from '../bookSearchIndex'
import { enrichSnippet, searchBookContent } from '../searchBook'

const leaves: TocLeaf[] = [
  { id: 'ch-1', index: 0 },
  { id: 'ch-2', index: 1 },
  { id: 'ch-3', index: 2 },
]

const titleLookup = new Map<string, string>([
  ['ch-1', 'First'],
  ['ch-2', 'Second'],
  ['ch-3', 'Third'],
])

/**
 * Build a tiny in-memory search index from plain bodies. Mirrors the Python
 * builder's algorithm so test fixtures match what the corpus would emit at
 * build time. `bodies[i]` is the body for `leaves[i].id` (chapter ids are
 * placed in the index in alphabetical order to match `sorted()`).
 */
function buildIndex(bodies: string[], lang = 'en-US'): BookSearchIndex {
  const sortedLeaves = [...leaves].sort((a, b) => a.id.localeCompare(b.id))
  const tokens: Record<string, number[]> = {}
  for (let i = 0; i < sortedLeaves.length; i++) {
    const body = bodies[sortedLeaves[i].index] ?? ''
    const text = stripHtml(body).toLowerCase()
    const counts = new Map<string, number>()
    for (const m of text.matchAll(TOKEN_RE)) {
      const stem = stemToken(m[0], lang)
      if (stem.length < 2) continue
      counts.set(stem, (counts.get(stem) ?? 0) + 1)
    }
    for (const [stem, n] of counts) {
      if (!tokens[stem]) tokens[stem] = []
      tokens[stem].push(i, n)
    }
  }
  return {
    v: 1,
    l: lang,
    s: 'snowball-english',
    c: sortedLeaves.map((l) => l.id),
    t: tokens,
  }
}

describe('searchBookContent', () => {
  it('returns empty for queries under 2 chars', () => {
    const bodies = ['<p>hello world</p>']
    const idx = buildIndex(bodies)
    expect(searchBookContent(idx, leaves, titleLookup, '')).toEqual([])
    expect(searchBookContent(idx, leaves, titleLookup, 'a')).toEqual([])
  })

  it('strips HTML before matching', () => {
    const bodies = ['<p>The <em>quick</em> brown fox</p>', '', '']
    const idx = buildIndex(bodies)
    const results = searchBookContent(idx, leaves, titleLookup, 'quick brown')
    expect(results).toHaveLength(1)
    expect(results[0].chapterId).toBe('ch-1')
  })

  it('is case-insensitive', () => {
    const bodies = ['<p>Hello World</p>', '', '']
    const idx = buildIndex(bodies)
    expect(searchBookContent(idx, leaves, titleLookup, 'WORLD')).toHaveLength(1)
  })

  it('ranks multiple matches by score', () => {
    const bodies = [
      '<p>first occurrence here</p>',
      '<p>second occurrence here occurrence</p>',
      '<p>third occurrence here</p>',
    ]
    const idx = buildIndex(bodies)
    const results = searchBookContent(idx, leaves, titleLookup, 'occurrence')
    expect(results.map((r) => r.chapterId).sort()).toEqual(['ch-1', 'ch-2', 'ch-3'])
    expect(results[0].chapterId).toBe('ch-2') // 2 hits, ranks first
  })

  it('caps total results', () => {
    const bodies = [Array(50).fill('<p>match me</p>').join('')]
    const idx = buildIndex(bodies)
    const results = searchBookContent(idx, leaves, titleLookup, 'match', 1)
    expect(results.length).toBeLessThanOrEqual(1)
  })

  it('matches inflections via stemming', () => {
    const bodies = [
      '<p>Many churches dot the landscape.</p>',
      '<p>The faithful are praying together.</p>',
      '',
    ]
    const idx = buildIndex(bodies)
    const churchResults = searchBookContent(idx, leaves, titleLookup, 'church')
    expect(churchResults.map((r) => r.chapterId)).toContain('ch-1')
    const prayResults = searchBookContent(idx, leaves, titleLookup, 'pray')
    expect(prayResults.map((r) => r.chapterId)).toContain('ch-2')
  })
})

describe('enrichSnippet', () => {
  it('produces snippet text + match offsets for an exact-substring query', () => {
    const body = '<p>The quick brown fox jumps over the lazy dog.</p>'
    const r = enrichSnippet(body, 'brown', 'en-US')
    expect(r).toBeDefined()
    expect(r?.snippet.slice(r.matchStart, r.matchEnd).toLowerCase()).toBe('brown')
  })

  it('finds an anchor via stemming when the exact phrase is absent', () => {
    // Body contains "theological" only — neither substring of nor a substring
    // of the query "theology". Stem fallback should bridge the gap.
    const body = '<p>The theological tradition speaks clearly here.</p>'
    const r = enrichSnippet(body, 'theology', 'en-US')
    expect(r).toBeDefined()
    expect(r?.snippet.slice(r.matchStart, r.matchEnd).toLowerCase()).toBe('theological')
  })

  it('falls back to chapter opening when no anchor is found', () => {
    const body = '<p>The faithful gather in silence.</p>'
    const r = enrichSnippet(body, 'transubstantiation', 'en-US')
    expect(r).toBeDefined()
    expect(r?.matchStart).toBe(0)
    expect(r?.matchEnd).toBe(0)
  })
})
