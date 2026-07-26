/**
 * The Morning Offering carries *standing* intentions — not the whole register.
 *
 * Before this, the block was authored `default: "all-active"`, so every
 * perpetual intention a user had ever raised was printed into the prayer every
 * morning. It now shows what is pinned to the practice, and anything else joins
 * for one sitting via "Carry more today".
 */

import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { pinMovement, raiseIntention } from '@/db/repositories'
import { renderApp } from '@/test/renderApp'

// Pins are keyed by the `[practiceId]` route param, which is the kind-prefixed
// catalog id — the same string the offering block receives.
const practiceId = 'practice/morning-offering'

const morningOfferingRoute = {
  pattern: '/pray/[practiceId]',
  loader: () => import('@/app/(tabs)/(today,explore,library,you,search)/pray/[practiceId]'),
}

function openMorningOffering(seed: () => Promise<void>) {
  return renderApp({
    route: `/pray/${practiceId}`,
    fixtures: { now: '2026-05-13' },
    routes: [morningOfferingRoute],
    seed,
  })
}

describe('Morning Offering — standing intentions', () => {
  it('shows the pinned intention and withholds the rest of the register', async () => {
    const { screen } = await openMorningOffering(async () => {
      const standingId = await raiseIntention({ text: "Dad's conversion", cadence: 'perpetual' })
      await raiseIntention({ text: 'A quiet worry from March', cadence: 'perpetual' })
      await raiseIntention({ text: 'Another old petition', cadence: 'perpetual' })
      await pinMovement(practiceId, standingId)
    })

    expect(
      (await screen.findAllByText(/Today's intentions/i, undefined, { timeout: 5000 }))[0],
    ).toBeInTheDocument()
    expect((await screen.findAllByText("Dad's conversion"))[0]).toBeInTheDocument()

    // The two unpinned petitions stay on the Altar.
    expect(screen.queryByText('A quiet worry from March')).toBeNull()
    expect(screen.queryByText('Another old petition')).toBeNull()
  }, 45_000)

  it('carries an unpinned intention for this sitting only', async () => {
    const { screen, user } = await openMorningOffering(async () => {
      await raiseIntention({ text: "Joao's surgery", cadence: 'perpetual' })
    })

    // Nothing is standing, so the block explains itself rather than listing.
    expect(
      (
        await screen.findAllByText(/Nothing standing in this prayer yet/i, undefined, {
          timeout: 5000,
        })
      )[0],
    ).toBeInTheDocument()

    await user.click((await screen.findAllByRole('button', { name: /Carry more today/i }))[0])
    await user.click((await screen.findAllByRole('button', { name: /Carry .Joao's surgery./i }))[0])

    expect((await screen.findAllByText("Joao's surgery"))[0]).toBeInTheDocument()

    // Carrying for today is not a pin — the register is untouched.
    expect(useEventStore.getState().pins.get(practiceId)?.size ?? 0).toBe(0)
  }, 45_000)

  it('carries standing intentions into the Rosary', async () => {
    const rosaryId = 'practice/rosary'
    const { screen } = await renderApp({
      route: `/pray/${rosaryId}`,
      fixtures: { now: '2026-05-13' },
      routes: [morningOfferingRoute],
      seed: async () => {
        const id = await raiseIntention({ text: 'Peace in the family', cadence: 'perpetual' })
        await raiseIntention({ text: 'Not this one', cadence: 'perpetual' })
        await pinMovement(rosaryId, id)
      },
    })

    expect(
      (await screen.findAllByText(/Offered for/i, undefined, { timeout: 5000 }))[0],
    ).toBeInTheDocument()
    expect((await screen.findAllByText('Peace in the family'))[0]).toBeInTheDocument()
    expect(screen.queryByText('Not this one')).toBeNull()
  }, 45_000)

  it('makes an intention standing from inside the prayer', async () => {
    let id = ''
    const { screen, user } = await openMorningOffering(async () => {
      id = await raiseIntention({ text: 'Mariana exams', cadence: 'perpetual' })
    })

    await user.click(
      (await screen.findAllByRole('button', { name: /Carry more today/i }, { timeout: 5000 }))[0],
    )
    await user.click((await screen.findAllByRole('button', { name: /Carry .Mariana exams./i }))[0])

    // The star turns a one-off into something the prayer keeps.
    await user.click(
      (await screen.findAllByRole('button', { name: /Always carry .Mariana exams./i }))[0],
    )

    expect(useEventStore.getState().pins.get(practiceId)?.has(id)).toBe(true)
  }, 45_000)
})
