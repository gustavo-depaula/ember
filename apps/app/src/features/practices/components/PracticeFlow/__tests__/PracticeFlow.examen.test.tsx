/**
 * Integration test for the new (post-PR-181) `examination-of-conscience` flow.
 *
 * Replaces the old hardcoded `app/examen.tsx` screen with a flow.json that
 * exercises the spiritual-threads DSL primitives. We're proving the
 * end-to-end path: open the player at the practice, see the rendered
 * review-resolution + capture-resolution blocks driven by real event state.
 *
 * Two scenarios:
 *   1. No prior resolution → Verificatio's review-resolution is skipped via
 *      `skip_if_none`; only the capture-resolution prompt for tomorrow renders.
 *   2. A pending (yesterday's, unreviewed) resolution exists → the
 *      review-resolution block surfaces it with Kept / Partial / Broken.
 */

import { describe, expect, it } from 'vitest'

import { setResolution } from '@/db/repositories/resolutions'
import { getToday } from '@/hooks/useToday'
import { renderApp } from '@/test/renderApp'

describe('examination-of-conscience flow', () => {
  it('renders the capture-resolution prompt for tomorrow on a first run', async () => {
    const { screen } = await renderApp({
      route: '/pray/practice/examination-of-conscience',
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(home)/pray/[practiceId]'),
        },
      ],
    })

    // The Verificatio review-resolution block has skip_if_none=true and
    // is not rendered on first run. The Hope & Resolution capture-resolution
    // block always renders.
    expect(
      (await screen.findAllByText(/One concrete resolution for tomorrow/i))[0],
    ).toBeInTheDocument()

    // The previous-resolution review prompt should NOT appear when there's
    // nothing pending.
    expect(screen.queryByText(/How did this resolution go/i)).toBeNull()
  }, 30_000)

  it('surfaces a pending resolution from yesterday for review', async () => {
    const { screen } = await renderApp({
      route: '/pray/practice/examination-of-conscience',
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/(tabs)/(home)/pray/[practiceId]'),
        },
      ],
    })

    // Pre-seed a daily resolution whose window has just closed (yesterday).
    // No `ResolutionReviewed` event → it counts as pending for today's
    // Verificatio.
    const todayStart = getToday().getTime()
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
    await setResolution({
      level: 'daily',
      text: 'Hold my tongue at the meeting',
      starts_at: yesterdayStart,
      ends_at: todayStart - 1,
      source: 'examen',
    })

    // The review-resolution block surfaces yesterday's resolution text and
    // the review prompt ("How did this resolution go?").
    expect((await screen.findAllByText('Hold my tongue at the meeting'))[0]).toBeInTheDocument()
    expect((await screen.findAllByText(/How did this resolution go/i))[0]).toBeInTheDocument()

    // The Kept/Partial/Broken outcome strip is wired.
    expect((await screen.findAllByRole('button', { name: 'Kept' })).length).toBeGreaterThan(0)
    expect((await screen.findAllByRole('button', { name: 'Partial' })).length).toBeGreaterThan(0)
    expect((await screen.findAllByRole('button', { name: 'Broken' })).length).toBeGreaterThan(0)
  }, 30_000)
})
