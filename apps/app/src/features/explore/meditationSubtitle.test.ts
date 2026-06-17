import { describe, expect, it } from 'vitest'

import type { TocNode } from '@/content/manifestTypes'
import { findTocNode } from './meditationSubtitle'

const toc: TocNode[] = [
  { id: 'tomo-1', title: { 'pt-BR': 'Tomo I' } },
  {
    id: 'advento',
    title: { 'pt-BR': 'Advento' },
    children: [
      {
        id: 'temeridade',
        title: { 'pt-BR': 'A temeridade do pecador', 'en-US': "The sinner's rashness" },
      },
      { id: 'encarnacao', title: { 'pt-BR': 'O decreto da Encarnação' } },
    ],
  },
]

describe('findTocNode', () => {
  it('finds a top-level node by id', () => {
    expect(findTocNode(toc, 'tomo-1')?.title['pt-BR']).toBe('Tomo I')
  })

  it('finds a nested node by id', () => {
    expect(findTocNode(toc, 'temeridade')?.title['en-US']).toBe("The sinner's rashness")
  })

  it('returns undefined for an unknown id or empty toc', () => {
    expect(findTocNode(toc, 'missing')).toBeUndefined()
    expect(findTocNode(undefined, 'temeridade')).toBeUndefined()
  })
})
