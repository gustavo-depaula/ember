/**
 * A granted petition — including a perpetual one.
 *
 * Answering used to be gated on `cadence`, so a lifelong intention that God
 * actually answered could only be "stopped", which filed the grace as attrition
 * and never reached the thanksgiving bridge. The note the user writes is kept on
 * the closed intention, so the register records *how* it was answered.
 */

import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { raiseIntention } from '@/db/repositories'
import { renderApp } from '@/test/renderApp'

const altarRoute = {
  pattern: '/altar',
  loader: () => import('@/app/(tabs)/(today,explore,library,you,search)/altar/index'),
}

function movementsOfKind(kind: 'intention' | 'thanksgiving') {
  return [...useEventStore.getState().movements.values()].filter((m) => m.kind === kind)
}

describe('answering an intention', () => {
  it('lets a perpetual intention be answered and become a thanksgiving', async () => {
    const { screen, user } = await renderApp({
      route: '/altar',
      routes: [altarRoute],
      seed: async () => {
        await raiseIntention({ text: "Dad's conversion", cadence: 'perpetual' })
      },
    })

    await user.click(
      (await screen.findAllByRole('button', { name: "Dad's conversion" }, { timeout: 5000 }))[0],
    )

    // The action exists for a perpetual intention, under its gentler wording.
    const answered = await screen.findAllByRole('button', { name: /God answered this/i })
    await user.click(answered[0])

    const field = await screen.findByPlaceholderText(/grace, a person, a providence/i)
    await user.clear(field)
    await user.type(field, 'He came back to the sacraments at Easter')

    await user.click((await screen.findAllByRole('button', { name: /Record gratitude/i }))[0])

    const intention = movementsOfKind('intention')[0]
    expect(intention.state).toBe('closed')
    expect(intention.closure_kind).toBe('answered')
    expect(intention.notes).toBe('He came back to the sacraments at Easter')

    const thanksgiving = movementsOfKind('thanksgiving')[0]
    expect(thanksgiving.text).toBe('He came back to the sacraments at Easter')
    expect(thanksgiving.from_intention).toBe(intention.id)
  }, 45_000)

  it('still closes the intention when the thanksgiving is declined', async () => {
    const { screen, user } = await renderApp({
      route: '/altar',
      routes: [altarRoute],
      seed: async () => {
        await raiseIntention({ text: 'A quiet petition', cadence: 'goal' })
      },
    })

    await user.click(
      (await screen.findAllByRole('button', { name: 'A quiet petition' }, { timeout: 5000 }))[0],
    )
    await user.click((await screen.findAllByRole('button', { name: /Mark answered/i }))[0])
    await user.click((await screen.findAllByRole('button', { name: /Not now/i }))[0])

    expect(movementsOfKind('intention')[0].state).toBe('closed')
    expect(movementsOfKind('intention')[0].notes).toBeUndefined()
    expect(movementsOfKind('thanksgiving')).toHaveLength(0)
  }, 45_000)
})
