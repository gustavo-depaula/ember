// Stubs the source at the package boundary so we exercise the full include
// pipeline (cycle → resolver → registry → preprocessor → PrimitiveBlock)
// without the network.

import { beforeEach, describe, expect, it, vi } from 'vitest'

type FetchCall = {
  date: Date
  prefs: { lang: string; translation: string }
  programDay?: number
  params: Record<string, unknown>
}

const fetchCalls: FetchCall[] = []

vi.mock('@/sources/ccc-compendium', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@/sources/ccc-compendium')
  return {
    ...actual,
    cccCompendiumSource: {
      ...actual.cccCompendiumSource,
      fetch: async (ctx: FetchCall) => {
        fetchCalls.push({
          date: ctx.date,
          prefs: ctx.prefs,
          programDay: ctx.programDay,
          params: ctx.params,
        })
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
  beforeEach(() => {
    fetchCalls.length = 0
  })

  it('renders day 1 (Qs 1..6) via cycle → include on a fresh program', async () => {
    const { screen } = await renderApp({
      route: '/pray/compendium',
      fixtures: { now: '2026-05-17' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(today,explore,library,you,search)/pray/[practiceId]'),
        },
      ],
    })

    // The day subheading renders from the cycle data — proves cycle picked
    // entry 0 for programDay=0.
    expect(await screen.findByText(/Day 1 · Questions 1[–-]6/)).toBeInTheDocument()

    // All 6 Qs render via the include + ProducerHtmlBlock.
    for (let q = 1; q <= 6; q++) {
      expect(await screen.findByTestId(`producer-anchor-q${q}`)).toBeInTheDocument()
    }
    expect(screen.queryByTestId('producer-anchor-q7')).toBeNull()

    expect(fetchCalls.length).toBeGreaterThan(0)
    const firstCall = fetchCalls[0]
    expect(firstCall.prefs.lang).toBe('en-US')
    expect(firstCall.params).toMatchObject({ first: '1', last: '6' })
  }, 30_000)
})
