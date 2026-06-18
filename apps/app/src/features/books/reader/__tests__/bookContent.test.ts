import { describe, expect, it } from 'vitest'
import type { BookEntry, TocNode } from '@/content/manifestTypes'
import { buildTitleLookup, flattenReadingFlow, promoteFirstHeading } from '../bookContent'

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

// Minimal manifest stub: every listed id has an en-US body blob.
function manifest(ids: string[]): Pick<BookEntry, 'chapters'> {
  return {
    chapters: Object.fromEntries(ids.map((id) => [id, { 'en-US': { hash: 'h', size: 1 } }])),
  }
}

describe('flattenReadingFlow', () => {
  it('includes every leaf in DFS order, skipping body-less groups', () => {
    const flow = flattenReadingFlow(sample, manifest([]), 'en-US')
    expect(flow.map((n) => n.id)).toEqual(['preface', 'ch-1', 'ch-2-a', 'ch-2-b', 'epilogue'])
    expect(flow.map((n) => n.index)).toEqual([0, 1, 2, 3, 4])
    expect(flow.every((n) => n.role === 'chapter')).toBe(true)
  })

  it('admits group nodes that carry a body, tagged by depth role', () => {
    const flow = flattenReadingFlow(sample, manifest(['book-1', 'ch-2']), 'en-US')
    expect(flow.map((n) => [n.id, n.role])).toEqual([
      ['preface', 'chapter'],
      ['book-1', 'part'],
      ['ch-1', 'chapter'],
      ['ch-2', 'section'],
      ['ch-2-a', 'chapter'],
      ['ch-2-b', 'chapter'],
      ['epilogue', 'chapter'],
    ])
  })

  it('honors an explicit role override', () => {
    const toc: TocNode[] = [{ id: 'intro', title: { 'en-US': 'Intro' }, role: 'section' }]
    expect(flattenReadingFlow(toc, manifest([]), 'en-US')[0].role).toBe('section')
  })
})

describe('promoteFirstHeading', () => {
  it('rewrites the first h1 to a role-styled h2', () => {
    expect(promoteFirstHeading('<h1>Title</h1>\n<p>x</p>', 'chapter')).toBe(
      '<h2 class="chapter-title">Title</h2>\n<p>x</p>',
    )
  })

  it('uses the part and section registers', () => {
    expect(promoteFirstHeading('<h1>P</h1>', 'part')).toBe('<h2 class="part-title">P</h2>')
    expect(promoteFirstHeading('<h1>S</h1>', 'section')).toBe('<h2 class="section-title">S</h2>')
  })

  it('only rewrites the first h1', () => {
    expect(promoteFirstHeading('<h1>A</h1><h1>B</h1>', 'chapter')).toBe(
      '<h2 class="chapter-title">A</h2><h1>B</h1>',
    )
  })

  it('is a no-op when there is no leading h1', () => {
    expect(promoteFirstHeading('<h2>Sub</h2><p>x</p>', 'chapter')).toBe('<h2>Sub</h2><p>x</p>')
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
