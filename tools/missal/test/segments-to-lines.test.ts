import { describe, expect, it } from 'vitest'
import { segmentsToLines } from '../src/enrich/segments-to-lines'
import type { RawSegment } from '../src/parse/types'

describe('segmentsToLines', () => {
  it('splits on breaks and paragraphs, merges adjacent text, drops empties', () => {
    const raw: RawSegment[] = [
      { type: 'rubric', text: 'Antífona da entrada' },
      { type: 'reference', text: 'Sl 24, 1-3' },
      { type: 'break' },
      { type: 'text', value: 'A vós, meu Deus, ' },
      { type: 'text', value: ' elevo a minha alma.' },
      { type: 'paragraph_start' },
      { type: 'text', value: 'Oremos.' },
      { type: 'paragraph_end' },
      { type: 'text', value: '   ' },
    ]
    const lines = segmentsToLines(raw)
    expect(lines).toEqual([
      [
        { type: 'rubric', text: 'Antífona da entrada' },
        { type: 'reference', text: 'Sl 24, 1-3' },
      ],
      [{ type: 'text', text: 'A vós, meu Deus, elevo a minha alma.' }],
      [{ type: 'text', text: 'Oremos.' }],
    ])
  })

  it('maps upstream class kinds onto the semantic vocabulary', () => {
    const raw: RawSegment[] = [
      { type: 'cross', text: '✠' },
      { type: 'people', text: 'Amém.' },
      { type: 'capital', text: 'N' },
      { type: 'reading_summary', text: 'Resumo da leitura' },
      { type: 'reading_acclamation', text: 'Palavra do Senhor.' },
    ]
    const [line] = segmentsToLines(raw)
    expect(line.map((s) => s.type)).toEqual(['signOfCross', 'response', 'dropCap', 'italic', 'response'])
  })

  it('turns headings into their own lines', () => {
    const raw: RawSegment[] = [
      { type: 'text', value: 'antes' },
      { type: 'heading', level: 2, text: 'GLÓRIA' },
      { type: 'text', value: 'depois' },
    ]
    const lines = segmentsToLines(raw)
    expect(lines).toEqual([
      [{ type: 'text', text: 'antes' }],
      [{ type: 'text', text: 'GLÓRIA' }],
      [{ type: 'text', text: 'depois' }],
    ])
  })
})
