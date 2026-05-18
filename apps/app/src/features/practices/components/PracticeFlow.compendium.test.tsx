// Stubs the producer at the package boundary so we exercise the full include
// pipeline (resolver → registry → SQLite cache → ProducerHtmlBlock) without
// the network.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const FIXTURE_DIR = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
  'packages',
  'ccc-compendium-producer',
  '__fixtures__',
)

type ProduceCall = {
  date: Date
  lang: string
  programDay?: number
  params?: Record<string, unknown>
}

const produceCalls: ProduceCall[] = []

vi.mock('@ember/ccc-compendium-producer', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@ember/ccc-compendium-producer')
  return {
    ...actual,
    cccCompendiumProgramProducer: {
      ...actual.cccCompendiumProgramProducer,
      produce: async (ctx: ProduceCall) => {
        produceCalls.push({
          date: ctx.date,
          lang: ctx.lang,
          programDay: ctx.programDay,
          params: ctx.params,
        })
        // Fake fixture output: just synthesize Qs 1..6 with the producer's
        // HTML shape so the renderer has something to mount. We test the
        // wiring here, not the parsing — parsing is covered upstream.
        const day = ctx.programDay ?? 0
        const qPerDay = 6
        const first = day * qPerDay + 1
        const last = Math.min((day + 1) * qPerDay, 598)
        const parts: string[] = []
        const anchors: Record<string, { chapter: string }> = {}
        for (let q = first; q <= last; q++) {
          parts.push(
            `<p id="q${q}"><b>${q}. Question ${q}?</b></p>` +
              `<p class="ccc-refs"><a data-ref="book/ccc#${q}">${q}</a></p>` +
              `<p>Answer ${q}.</p>`,
          )
          anchors[String(q)] = { chapter: 'part-1' }
        }
        return { html: parts.join('\n'), anchors }
      },
    },
  }
})

import { programDayToQuestionRange } from '@ember/ccc-compendium-producer'
import { renderApp } from '@/test/renderApp'

describe('PracticeFlow — compendium (program practice)', () => {
  beforeEach(() => {
    produceCalls.length = 0
  })

  it('renders the first day of Qs (1..6) on a fresh program with linkified CCC refs', async () => {
    // programDay is 0-indexed: a fresh program shows day 0 = Qs 1..6.
    const [firstQ, lastQ] = programDayToQuestionRange(0, 6)
    expect([firstQ, lastQ]).toEqual([1, 6])

    const { screen } = await renderApp({
      route: '/pray/compendium',
      fixtures: { now: '2026-05-17' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/pray/[practiceId]'),
        },
      ],
    })

    // The full day's Q range is present.
    for (let q = firstQ; q <= lastQ; q++) {
      expect(await screen.findByTestId(`producer-anchor-q${q}`)).toBeInTheDocument()
    }
    // A Q outside the range is not rendered.
    expect(screen.queryByTestId('producer-anchor-q7')).toBeNull()

    // CCC paragraph references are linkified.
    const refChips = screen.queryAllByTestId(/^producer-ref-book\/ccc#/)
    expect(refChips.length).toBeGreaterThan(0)

    // produce(ctx) saw programDay=0 (fresh-program cursor).
    expect(produceCalls.length).toBeGreaterThan(0)
    const firstCall = produceCalls[0]
    expect(firstCall.lang).toBe('en-US')
    expect(firstCall.programDay).toBe(0)
  }, 30_000)
})
