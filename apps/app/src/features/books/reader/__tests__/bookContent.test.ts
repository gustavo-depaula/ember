import { describe, expect, it } from 'vitest'
import type { TocNode } from '@/content/resolver'
import { buildTitleLookup, flattenTocLeaves } from '../bookContent'

const sample: TocNode[] = [
  { id: 'preface', title: { 'en-US': 'Preface', 'pt-BR': 'Prefácio' } },
  {
    id: 'book-1',
    title: { 'en-US': 'Book One' },
    children: [
      { id: 'ch-1', title: { 'en-US': 'Chapter 1' } },
      {
        id: 'ch-2',
        title: { 'en-US': 'Chapter 2' },
        children: [
          { id: 'ch-2-a', title: { 'en-US': 'Section A' } },
          { id: 'ch-2-b', title: { 'en-US': 'Section B' } },
        ],
      },
    ],
  },
  { id: 'epilogue', title: { 'en-US': 'Epilogue' } },
]

describe('flattenTocLeaves', () => {
  it('returns only leaves in reading order, skipping section nodes', () => {
    expect(flattenTocLeaves(sample).map((l) => l.id)).toEqual([
      'preface',
      'ch-1',
      'ch-2-a',
      'ch-2-b',
      'epilogue',
    ])
  })

  it('assigns sequential indices', () => {
    expect(flattenTocLeaves(sample).map((l) => l.index)).toEqual([0, 1, 2, 3, 4])
  })
})

describe('buildTitleLookup', () => {
  it('resolves preferred language', () => {
    const m = buildTitleLookup(sample, 'pt-BR')
    expect(m.get('preface')).toBe('Prefácio')
  })

  it('falls back to first language when preferred is missing', () => {
    const m = buildTitleLookup(sample, 'pt-BR')
    expect(m.get('ch-1')).toBe('Chapter 1')
  })

  it('includes section titles, not just leaves', () => {
    const m = buildTitleLookup(sample, 'en-US')
    expect(m.get('book-1')).toBe('Book One')
    expect(m.get('ch-2')).toBe('Chapter 2')
  })
})
