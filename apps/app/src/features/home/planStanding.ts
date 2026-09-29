import type { TimeBlock } from '@/db/schema'
import { blockEnds, blockOrder, dayMinutes } from '@/features/plan-of-life/timeBlocks'

export type EntryStatus = 'done' | 'pending' | 'late'
export type DayStanding = 'done' | 'ontrack' | 'delayed' | 'atrisk'
export type PlanEntry = { id: string; name: string; block: TimeBlock; status: EntryStatus }

// How long past its time a practice may wait before the day counts as
// delayed, and then as at risk of being missed.
const delayedAfter = 60
const atRiskAfter = 180

/**
 * When a practice is owed, in logical-day minutes: at its time, or with none
 * by the end of its part of the day. An any-time practice is never owed.
 */
export function owedAt(block: TimeBlock, time: string | null | undefined): number | undefined {
  if (time) return dayMinutes(time)
  return block === 'flexible' ? undefined : blockEnds[block]
}

/**
 * The day's plan as a stop light. A practice is late an hour past when it is
 * owed (owedAt). The day is on track until something has waited
 * that hour (delayed), and at risk once something has waited three.
 */
export function planStanding(
  blocks: { block: TimeBlock; slots: { id: string; name: string; owed?: number }[] }[],
  doneIds: Set<string>,
  now: number,
): { entries: PlanEntry[]; done: number; standing: DayStanding } {
  let worst = -Infinity
  let done = 0
  const entries = blocks.flatMap(({ block, slots }) =>
    slots.map(({ id, name, owed }): PlanEntry => {
      if (doneIds.has(id)) {
        done++
        return { id, name, block, status: 'done' }
      }
      const overdue = now - (owed ?? Infinity)
      worst = Math.max(worst, overdue)
      return { id, name, block, status: overdue >= delayedAfter ? 'late' : 'pending' }
    }),
  )
  return { entries, done, standing: standingOf(done === entries.length, worst) }
}

function standingOf(allDone: boolean, worstOverdue: number): DayStanding {
  if (allDone) return 'done'
  if (worstOverdue >= atRiskAfter) return 'atrisk'
  return worstOverdue >= delayedAfter ? 'delayed' : 'ontrack'
}

/**
 * The `count` entries around the time of day: from the first unprayed one of
 * the current part of the day (or the next part with any) onward in plan
 * order, topped up with the ones just before it when the day runs short.
 */
export function entriesAround(
  entries: PlanEntry[],
  current: TimeBlock,
  count: number,
): PlanEntry[] {
  const now = blockOrder.indexOf(current)
  const fromNow = entries.findIndex(
    (e) => e.status !== 'done' && blockOrder.indexOf(e.block) >= now,
  )
  const start = fromNow === -1 ? entries.length : fromNow
  const after = entries.slice(start, start + count)
  const before = entries.slice(Math.max(0, start - (count - after.length)), start)
  return [...before, ...after]
}
