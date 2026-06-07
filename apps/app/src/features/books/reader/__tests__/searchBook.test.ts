import { describe, expect, it } from 'vitest'
import type { TocLeaf } from '../bookContent'
import { searchBookContent } from '../searchBook'

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

describe('searchBookContent', () => {
  it('returns empty for queries under 2 chars', () => {
    const bodies = ['<p>hello world</p>']
    expect(searchBookContent(bodies, leaves, titleLookup, '')).toEqual([])
    expect(searchBookContent(bodies, leaves, titleLookup, 'a')).toEqual([])
  })

  it('strips HTML before matching', () => {
    const bodies = ['<p>The <em>quick</em> brown fox</p>', '', '']
    const results = searchBookContent(bodies, leaves, titleLookup, 'quick brown')
    expect(results).toHaveLength(1)
    expect(results[0].snippet).toContain('quick brown')
    expect(results[0].chapterId).toBe('ch-1')
  })

  it('is case-insensitive', () => {
    const bodies = ['<p>Hello World</p>', '', '']
    expect(searchBookContent(bodies, leaves, titleLookup, 'WORLD')).toHaveLength(1)
  })

  it('returns multiple matches in reading order', () => {
    const bodies = [
      '<p>first occurrence here</p>',
      '<p>second occurrence here</p>',
      '<p>third occurrence here</p>',
    ]
    const results = searchBookContent(bodies, leaves, titleLookup, 'occurrence')
    expect(results.map((r) => r.chapterId)).toEqual(['ch-1', 'ch-2', 'ch-3'])
  })

  it('reports match offsets within the snippet', () => {
    const bodies = ['<p>The quick brown fox jumps over the lazy dog</p>', '', '']
    const [r] = searchBookContent(bodies, leaves, titleLookup, 'brown')
    expect(r.snippet.slice(r.matchStart, r.matchEnd).toLowerCase()).toBe('brown')
  })

  it('caps total results', () => {
    const bodies = [Array(50).fill('<p>match me</p>').join('')]
    const results = searchBookContent(bodies, leaves, titleLookup, 'match', 10)
    expect(results).toHaveLength(10)
  })
})
