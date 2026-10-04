/**
 * The startup fold of bare-id practices into their canonical twins, against
 * the real catalog: a corpus practice moves, a practice with no corpus entry
 * stays, and a second launch finds nothing left to do — a fold that seeding
 * undid would grow the event log on every start.
 */
import { Text } from 'tamagui'
import { describe, expect, it } from 'vitest'

import { useEventStore } from '@/db/events'
import { getEventCount } from '@/db/events/store'
import { createPracticeWithSlot, logCompletion } from '@/db/repositories'
import { canonicalizePracticeIds, seedPractices } from '@/db/seed'
import { renderApp } from '@/test/renderApp'

describe('canonicalizePracticeIds', () => {
  it('folds a template-added practice into its seeded twin, once', async () => {
    await renderApp({
      route: '/blank',
      routes: [{ pattern: '/blank', loader: async () => ({ default: () => <Text>blank</Text> }) }],
    })
    await createPracticeWithSlot({ id: 'mass' }, { time: '10:00' })
    await createPracticeWithSlot({ id: 'jesus-prayer', customName: 'Jesus Prayer' }, {})
    await logCompletion('mass', '2026-05-10', '1', 'mass', 'checkin')

    await canonicalizePracticeIds()

    const { practices, slots, completions } = useEventStore.getState()
    expect(practices.has('mass')).toBe(false)
    expect(practices.has('jesus-prayer')).toBe(false)
    expect(practices.has('examination-conscience')).toBe(true)
    const moved = [...slots.values()].find((s) => s.time === '10:00')
    expect(moved?.practice_id).toBe('practice/mass')
    expect([...completions.values()].map((c) => `${c.practice_id}::${c.sub_id}`)).toEqual([
      moved?.id,
    ])

    const settled = await getEventCount()
    await seedPractices()
    await canonicalizePracticeIds()
    expect(await getEventCount()).toBe(settled)
  }, 30_000)
})
