/**
 * The ambient "Offered for" line — the offering, present in every prayer at the
 * lowest volume the ladder allows.
 *
 * Two rules keep one muted line across ~350 practices from becoming the wall of
 * text this whole effort set out to remove: it is invisible to anyone with
 * nothing on their Altar, and it defers to any flow that authors a real
 * offering block.
 */

import { describe, expect, it } from 'vitest'

import { pinMovement, raiseIntention } from '@/db/repositories'
import { renderApp } from '@/test/renderApp'

const prayRoute = {
  pattern: '/pray/[practiceId]',
  loader: () => import('@/app/(tabs)/(today,explore,library,you,search)/pray/[practiceId]'),
}

function open(practiceId: string, seed?: () => Promise<void>) {
  return renderApp({
    route: `/pray/${practiceId}`,
    fixtures: { now: '2026-05-13' },
    routes: [prayRoute],
    seed,
  })
}

describe('ambient offering line', () => {
  it('stays invisible when there is nothing on the Altar', async () => {
    const { screen } = await open('practice/angelus')

    // Wait for the practice itself before asserting an absence.
    expect(
      (await screen.findAllByText(/Angelus/i, undefined, { timeout: 5000 })).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText(/Offer this prayer for someone/i)).toBeNull()
    expect(screen.queryByText(/Offered for/i)).toBeNull()
  }, 45_000)

  it('invites quietly on an ordinary prayer once an intention exists', async () => {
    const { screen } = await open('practice/angelus', async () => {
      await raiseIntention({ text: 'A hidden need', cadence: 'perpetual' })
    })

    expect(
      (
        await screen.findAllByText(/Offer this prayer for someone/i, undefined, { timeout: 5000 })
      )[0],
    ).toBeInTheDocument()
  }, 45_000)

  it('names what a practice is standing for', async () => {
    const practiceId = 'practice/angelus'
    const { screen } = await open(practiceId, async () => {
      const id = await raiseIntention({ text: 'My godson', cadence: 'perpetual' })
      await raiseIntention({ text: 'Another need', cadence: 'perpetual' })
      await pinMovement(practiceId, id)
    })

    expect(
      (await screen.findAllByText(/Offered for My godson/i, undefined, { timeout: 5000 }))[0],
    ).toBeInTheDocument()
  }, 45_000)

  it('defers to a flow that authors its own offering block', async () => {
    const { screen } = await open('practice/morning-offering', async () => {
      await raiseIntention({ text: 'A hidden need', cadence: 'perpetual' })
    })

    // The block's own heading is present…
    expect(
      (await screen.findAllByText(/Today's intentions/i, undefined, { timeout: 5000 }))[0],
    ).toBeInTheDocument()
    // …and the ambient line stays out of its way.
    expect(screen.queryByText(/Offer this prayer for someone/i)).toBeNull()
  }, 45_000)
})
