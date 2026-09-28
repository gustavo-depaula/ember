import type { TimeBlock } from '@/db/schema'
import { blockOrder } from '@/features/plan-of-life/timeBlocks'

export type EntryStatus = 'done' | 'due' | 'late' | 'ahead'
export type DayStanding = 'done' | 'ontrack' | 'due' | 'late'
export type PlanEntry = { id: string; name: string; block: TimeBlock; status: EntryStatus }

/**
 * The day's plan as a stop light. A practice is done, due (its part of the day
 * is now — or, prayable any time, the evening has come), late (its part of the
 * day has passed) or ahead. The day takes its worst practice: behind, due now,
 * on track (nothing due yet) or done.
 */
export function planStanding(
  blocks: { block: TimeBlock; slots: { id: string; name: string }[] }[],
  doneIds: Set<string>,
  current: TimeBlock,
): { entries: PlanEntry[]; done: number; standing: DayStanding } {
  const now = blockOrder.indexOf(current)
  const statusOf = (id: string, block: TimeBlock): EntryStatus => {
    if (doneIds.has(id)) return 'done'
    if (block === 'flexible') return current === 'evening' ? 'due' : 'ahead'
    const at = blockOrder.indexOf(block)
    if (at < now) return 'late'
    return at === now ? 'due' : 'ahead'
  }
  const entries = blocks.flatMap(({ block, slots }) =>
    slots.map((s) => ({ id: s.id, name: s.name, block, status: statusOf(s.id, block) })),
  )
  const worst = (['late', 'due', 'ahead'] as const).find((s) => entries.some((e) => e.status === s))
  const standing: DayStanding = worst === 'ahead' ? 'ontrack' : (worst ?? 'done')
  return { entries, done: entries.filter((e) => e.status === 'done').length, standing }
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
