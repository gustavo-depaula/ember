/**
 * The startup fold of bare-id practices into their canonical twins, against
 * the real catalog: a corpus practice moves, a practice with no corpus entry
 * stays, and a second launch finds nothing left to do — a fold that ran again
 * would grow the event log on every start.
 */
import { Text } from 'tamagui'
import { describe, expect, it } from 'vitest'
import { canonicalizePracticeIds, foldMergedPractices } from '@/db/canonicalizePracticeIds'
import { useEventStore } from '@/db/events'
import { getEventCount } from '@/db/events/store'
import { createPracticeWithSlot, logCompletion } from '@/db/repositories'
import { addSlotUnderKey } from '@/db/test-fixtures'
import { renderApp } from '@/test/renderApp'

describe('canonicalizePracticeIds', () => {
  it('folds a template-added practice into its canonical id, once', async () => {
    await renderApp({
      route: '/blank',
      routes: [{ pattern: '/blank', loader: async () => ({ default: () => <Text>blank</Text> }) }],
    })
    await addSlotUnderKey({ id: 'mass' }, '1', { time: '10:00' })
    await createPracticeWithSlot({ id: 'jesus-prayer', customName: 'Jesus Prayer' }, {})
    await createPracticeWithSlot({ id: 'family-prayer', customName: 'Family prayer' }, {})
    await logCompletion('mass', '2026-05-10', '1', 'mass', 'checkin')

    await canonicalizePracticeIds()

    const { practices, slots, completions } = useEventStore.getState()
    expect(practices.has('mass')).toBe(false)
    expect(practices.has('jesus-prayer')).toBe(false)
    expect(practices.has('family-prayer')).toBe(true)
    const moved = [...slots.values()].find((s) => s.time === '10:00')
    expect(moved?.practice_id).toBe('practice/mass')
    expect([...completions.values()].map((c) => `${c.practice_id}::${c.sub_id}`)).toEqual([
      moved?.id,
    ])

    const settled = await getEventCount()
    await canonicalizePracticeIds()
    expect(await getEventCount()).toBe(settled)
  }, 30_000)
})

// The built catalog publishes Gospel of the Day again as an alias of the Daily
// Liturgy it was merged into.
describe('foldMergedPractices', () => {
  it('moves a practice kept under a former id to the one it became, once', async () => {
    await renderApp({
      route: '/blank',
      routes: [{ pattern: '/blank', loader: async () => ({ default: () => <Text>blank</Text> }) }],
    })
    await addSlotUnderKey({ id: 'practice/gospel-of-the-day' }, '1', { time: '07:15' })
    await logCompletion(
      'practice/gospel-of-the-day',
      '2026-11-20',
      '1',
      'gospel-of-the-day',
      'amen',
    )

    await foldMergedPractices()

    const { practices, slots, completions } = useEventStore.getState()
    expect(practices.has('practice/gospel-of-the-day')).toBe(false)
    const moved = [...slots.values()].find((s) => s.time === '07:15')
    expect(moved?.practice_id).toBe('practice/daily-liturgy')
    expect([...completions.values()].map((c) => `${c.practice_id}::${c.sub_id}`)).toEqual([
      moved?.id,
    ])

    const settled = await getEventCount()
    await foldMergedPractices()
    expect(await getEventCount()).toBe(settled)
  }, 30_000)
})
