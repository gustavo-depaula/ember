/**
 * Integration tests for MovementScreen on /intentions.
 *
 * Focus: the visible-on-mount surfaces — the audit-introduced inline empty-
 * state CTA, and the projection-driven list. The action-menu sheet path is
 * exercised by `__tests__/projection.test.ts` + `__tests__/bridge.test.ts`
 * at the event-store layer, where the cadence-aware verbs and bridge logic
 * are unit-testable without Modal-portal hassle.
 */

import { describe, expect, it } from 'vitest'

import { raiseIntention } from '@/db/repositories/movements'
import { renderApp } from '@/test/renderApp'

describe('MovementScreen — /intentions', () => {
  it('shows an empty-state CTA on a fresh app and opens the capture sheet', async () => {
    const { screen, user } = await renderApp({
      route: '/intentions',
      routes: [
        {
          pattern: '/intentions',
          loader: () => import('@/app/intentions/index'),
        },
      ],
    })

    // Empty placeholder visible.
    expect(await screen.findByText(/No intentions yet/i)).toBeInTheDocument()

    // The audit-introduced inline CTA: an extra "Raise" pressable inside the
    // empty card. The header still has its own "Raise" button.
    const raiseButtons = await screen.findAllByRole('button', { name: 'Raise' })
    expect(raiseButtons.length).toBeGreaterThanOrEqual(2)

    // Click the inline empty-state CTA (last one — header is rendered first).
    await user.click(raiseButtons[raiseButtons.length - 1])

    // Capture sheet appears with the intention prompt.
    expect((await screen.findAllByText(/Lift up an intention/i))[0]).toBeInTheDocument()
  }, 20_000)

  it('renders pre-seeded intentions and hides the empty state', async () => {
    const { screen } = await renderApp({
      route: '/intentions',
      routes: [
        {
          pattern: '/intentions',
          loader: () => import('@/app/intentions/index'),
        },
      ],
    })

    await raiseIntention({ text: 'For my parents’ health', cadence: 'perpetual' })

    // The card surfaces the new intention text.
    const cards = await screen.findAllByText('For my parents’ health')
    expect(cards.length).toBeGreaterThan(0)

    // Empty state copy is gone now that there's something to show.
    expect(screen.queryByText(/No intentions yet/i)).toBeNull()
  }, 20_000)
})
