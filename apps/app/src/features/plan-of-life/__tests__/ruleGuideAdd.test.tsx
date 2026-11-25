import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { renderApp } from '@/test/renderApp'

import { RuleGuide } from '../components/RuleGuide'

// A practice without its own hour waits on the time sheet and adds nothing until
// it is confirmed, so a slot here means it went in with one tap.
const slotsOf = (practiceId: string) =>
  [...useEventStore.getState().slots.values()].filter((s) => s.practice_id === practiceId)

async function openGuide() {
  return renderApp({
    route: '/plan/add',
    routes: [{ pattern: '/plan/add', loader: async () => ({ default: RuleGuide }) }],
  })
}

describe('adding from “Add to the rule”', () => {
  it('puts the Rosary in at its own evening hour, without asking', async () => {
    const { screen, user } = await openGuide()
    await user.click(await screen.findByRole('button', { name: /Add .*Rosary.* to your rule/ }))

    await expect.poll(() => slotsOf('practice/rosary')).toHaveLength(1)
    expect(slotsOf('practice/rosary')[0]).toMatchObject({ time: '20:00', enabled: 1 })
  }, 30_000)
})
