/**
 * End-to-end "daily loop" UI test — the centerpiece of spiritual-threads.
 *
 *   Tuesday dusk    Examen — type a resolution, tap Set
 *   Wednesday dawn  Morning Offering opens with the resolution at the top
 *
 * Everything user-driven: typing into the real textarea, clicking the real
 * Set button, advancing the time-travel anchor, navigating to a different
 * route. No simulated events.
 */

import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { renderApp } from '@/test/renderApp'
import { navigate } from '@/test/router-fake'

describe('daily resolution loop — Examen → next-day Morning Offering', () => {
  it('captures at dusk and surfaces at dawn the next day', async () => {
    const { screen, user } = await renderApp({
      route: '/pray/practice/examination-of-conscience',
      fixtures: { now: '2026-05-12' },
      routes: [
        {
          pattern: '/pray/[practiceId]',
          loader: () => import('@/app/pray/[practiceId]'),
        },
      ],
    })

    // 1. Examen mounts with the capture-resolution block visible.
    expect(
      (await screen.findAllByText(/One concrete resolution for tomorrow/i))[0],
    ).toBeInTheDocument()

    // 2. Type a resolution into the inline textarea. The capture-resolution
    //    block renders inline (no Modal portal), so there's exactly one
    //    textarea with this placeholder.
    const textarea = await screen.findByPlaceholderText(/A concrete resolution/i)
    await user.type(textarea, 'Hold my tongue at the meeting')

    // 3. Tap "Set". The block runs setResolution, then swaps to a
    //    "Resolution set." confirmation in place.
    const setButton = await screen.findByRole('button', { name: 'Set' })
    await user.click(setButton)

    expect((await screen.findAllByText(/Resolution set/i))[0]).toBeInTheDocument()

    // 4. The event landed in the projection with the right window — starts
    //    on Wednesday (the day *after* the Tuesday Examen).
    const stored = Array.from(useEventStore.getState().resolutions.values())
    expect(stored).toHaveLength(1)
    expect(stored[0].text).toBe('Hold my tongue at the meeting')
    expect(format(new Date(stored[0].starts_at), 'yyyy-MM-dd')).toBe('2026-05-13')

    // 5. Advance time-travel to Wednesday. `useToday` reads this on render
    //    and `pickActive` will now consider the resolution active.
    usePreferencesStore.getState().setTimeTravelDate('2026-05-13')

    // 6. Navigate to Morning Offering. Its flow opens with a
    //    `<review-resolution mode="show" target="active-daily">` block —
    //    if a resolution is active for today, the block renders it.
    navigate('/pray/practice/morning-offering')

    // 7. The Wednesday Morning Offering surfaces what Tuesday's Examen wrote.
    //    This is the proof that the dusk-to-dawn handoff works end-to-end.
    expect((await screen.findAllByText('Hold my tongue at the meeting'))[0]).toBeInTheDocument()
  }, 45_000)
})
