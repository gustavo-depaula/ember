/**
 * Integration test for the Plan-of-Life Resolutions panel — TODAY card.
 *
 * Pre-seeds an active daily resolution, renders `/plan`, asserts the panel
 * surfaces it, taps Kept, and verifies a checkin event is appended.
 *
 * Why direct emit instead of a fixture field: `TestFixtures` is the dev-only
 * surface the Maestro `/dev/reset` deep link uses. Resolutions aren't part
 * of its API; the in-test imperative path is the right scope.
 */

import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { setResolution } from '@/db/repositories/resolutions'
import { getToday } from '@/hooks/useToday'
import { renderApp } from '@/test/renderApp'

describe('ResolutionsPanel — daily TODAY card', () => {
  it('renders the active daily resolution and records a Kept checkin', async () => {
    const { screen, user } = await renderApp({
      route: '/plan',
      routes: [
        {
          pattern: '/plan',
          loader: () => import('@/app/plan/index'),
        },
      ],
    })

    // `pickActive` (via the `useActiveResolution` hook) anchors "now" to
    // `useToday()`, which is the *start* of today (midnight) — not real-time.
    // Make sure starts_at <= midnight-today so the resolution counts as active.
    const todayStart = getToday().getTime()
    await setResolution({
      level: 'daily',
      text: 'Pause before speaking',
      starts_at: todayStart,
      ends_at: todayStart + 1000 * 60 * 60 * 24 - 1,
      source: 'examen',
    })

    expect(await screen.findByText('Pause before speaking')).toBeInTheDocument()

    const keptButton = await screen.findByRole('button', { name: 'Kept' })
    await user.click(keptButton)

    const state = useEventStore.getState()
    const resolutionId = Array.from(state.resolutions.values())[0]?.id
    expect(resolutionId).toBeDefined()
    const reviews = state.resolutionReviews.get(resolutionId as string) ?? []
    expect(reviews).toHaveLength(1)
    expect(reviews[0].kind).toBe('checkin')
    expect(reviews[0].outcome).toBe('kept')
  }, 20_000)
})
