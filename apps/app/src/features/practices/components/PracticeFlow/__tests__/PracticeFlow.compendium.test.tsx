// Stubs the source at the package boundary so we exercise the full include
// pipeline (cycle → resolver → registry → preprocessor → PrimitiveBlock)
// without the network.

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/sources/ccc-compendium', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@/sources/ccc-compendium')
  return {
    ...actual,
    cccCompendiumSource: {
      ...actual.cccCompendiumSource,
      fetch: async (ctx: { params?: Record<string, unknown> }) => {
        const first = Number(ctx.params?.first ?? 1)
        const last = Number(ctx.params?.last ?? 6)
        const blocks: unknown[] = []
        const anchors: Record<string, { chapter: string }> = {}
        for (let q = first; q <= last; q++) {
          blocks.push(
            {
              kind: 'paragraph',
              id: `q${q}`,
              inline: [{ kind: 'bold', text: `${q}. Question ${q}?` }],
            },
            {
              kind: 'paragraph',
              className: 'ccc-refs',
              inline: [{ kind: 'ref', ref: `book/ccc#${q}`, text: String(q) }],
            },
            {
              kind: 'paragraph',
              inline: [{ kind: 'text', text: `Answer ${q}.` }],
            },
          )
          anchors[String(q)] = { chapter: 'part-1' }
        }
        return { type: 'prose', blocks, anchors }
      },
    },
  }
})

import { renderApp } from '@/test/renderApp'

describe('PracticeFlow — compendium (program practice)', () => {
  it('renders day 1 (Qs 1..6) via cycle → include on a fresh program', async () => {
    const { screen } = await renderApp({
      route: '/pray/compendium',
      fixtures: { now: '2026-05-17' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(today,you,search)/pray/[practiceId]'),
        },
      ],
    })

    // The day subheading comes from the cycle entry for programDay=0.
    expect(await screen.findByText(/Day 1 · Questions 1[–-]6/)).toBeInTheDocument()

    // The stub renders exactly the questions in the cycle's params.
    for (let q = 1; q <= 6; q++) {
      expect(await screen.findByTestId(`producer-anchor-q${q}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('producer-anchor-q7')).toBeNull()
  }, 30_000)
})
