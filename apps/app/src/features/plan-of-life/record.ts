import { addDays, format, parseISO, subDays } from 'date-fns'
import type { WritableDraft } from 'immer'

import type { EventStoreState } from '@/db/events'
import { applyEvent } from '@/db/events/projections'
import type { AppEvent } from '@/db/events/types'
import type { Tier } from '@/db/schema'
import { parseSlotKey } from '@/lib/slotKey'

import { isApplicableOn, parseSchedule, type Schedule, type ScheduleContext } from './schedule'

export type TimedEvent = { event: AppEvent; timestamp: number }

/** The practice's rule as it stood at the end of `date`: its enabled times. */
export type RuleSnapshot = {
  date: string
  slots: { id: string; schedule: Schedule; tier: Tier }[]
}

type DayKeeping = 'kept' | 'missed' | 'partial' | 'free'

/**
 * The rule's history, one snapshot per day it changed, replayed through the
 * store's own projection so archive, unarchive and slot edits mean here exactly
 * what they mean in the plan.
 */
export function ruleTimeline(practiceId: string, events: TimedEvent[]): RuleSnapshot[] {
  const state = {
    practices: new Map(),
    slots: new Map(),
    completions: new Map(),
    completionsByDate: new Map(),
    completionsByPractice: new Map(),
    cursors: new Map(),
    nextCompletionId: 1,
  } as unknown as WritableDraft<EventStoreState>
  const snapshots: RuleSnapshot[] = []

  for (const { event, timestamp } of events) {
    if (!concerns(event, practiceId)) continue
    applyEvent(state, event)
    const date = format(timestamp, 'yyyy-MM-dd')
    const archived = state.practices.get(practiceId)?.archived === 1
    const slots = archived
      ? []
      : [...state.slots.values()]
          .filter((s) => s.practice_id === practiceId && s.enabled === 1)
          .map((s) => ({
            id: parseSlotKey(s.id).slotId,
            schedule: parseSchedule(s.schedule),
            tier: s.tier,
          }))
    if (snapshots.at(-1)?.date === date) snapshots[snapshots.length - 1] = { date, slots }
    else snapshots.push({ date, slots })
  }
  return snapshots
}

function concerns(event: AppEvent, practiceId: string): boolean {
  if ('practiceId' in event) {
    return event.practiceId === practiceId && !event.type.startsWith('Completion')
  }
  if (event.type === 'SlotUpdated') return parseSlotKey(event.slotKey).practiceId === practiceId
  return false
}

function snapshotAt(timeline: RuleSnapshot[], date: string): RuleSnapshot | undefined {
  let found: RuleSnapshot | undefined
  for (const s of timeline) {
    if (s.date > date) break
    found = s
  }
  return found
}

/**
 * How a day went against the rule in force on it. A time owed all day — in
 * the rule since before the day began — has to be prayed; one added or moved
 * onto the day that same day counts only if it was. Completions logged outside
 * any due time (prayed from the library, say) stand in for a due one.
 */
function keepingOn(
  timeline: RuleSnapshot[],
  date: string,
  prayed: string[],
  ctx: ScheduleContext | undefined,
): DayKeeping {
  const day = parseISO(date)
  const dueIn = (s: RuleSnapshot | undefined) =>
    (s?.slots ?? []).filter((slot) => isApplicableOn(slot.schedule, day, ctx)).map((x) => x.id)
  const dueByEnd = dueIn(snapshotAt(timeline, date))
  if (dueByEnd.length === 0) return 'free'
  const owed = new Set(dueIn(snapshotAt(timeline, format(subDays(day, 1), 'yyyy-MM-dd'))))
  const required = dueByEnd.filter((id) => owed.has(id))

  const matched = required.filter((id) => prayed.includes(id)).length
  const spare = prayed.filter((id) => !dueByEnd.includes(id)).length
  if (required.length === 0) return prayed.length > 0 ? 'kept' : 'free'
  if (matched + spare >= required.length) return 'kept'
  return matched + spare > 0 ? 'partial' : 'missed'
}

export type PracticeRecord = {
  /** Every completion ever logged. */
  count: number
  /** The first day of the current unbroken run of kept days, if any. */
  since?: string
}

/**
 * Walks back from today through the days the rule asked for the practice.
 * Today only counts once kept, so an evening prayer doesn't read as a lapse at
 * breakfast; days the rule didn't ask for are passed over.
 */
export function practiceRecord({
  timeline,
  completions,
  today,
  contextFor,
}: {
  timeline: RuleSnapshot[]
  completions: { date: string; subId: string | null }[]
  today: string
  contextFor: (date: Date) => ScheduleContext | undefined
}): PracticeRecord {
  const count = completions.length
  const first = timeline[0]?.date
  if (!first) return { count }
  const prayedBy = byDate(completions)

  let since: string | undefined
  for (let d = parseISO(today); ; d = subDays(d, 1)) {
    const date = format(d, 'yyyy-MM-dd')
    if (date < first) break
    const keeping = keepingOn(timeline, date, prayedBy.get(date) ?? [], contextFor(d))
    if (keeping === 'kept') since = date
    else if (keeping !== 'free' && date !== today) break
  }
  return { count, since }
}

/**
 * The constellation's stars for the last `days` days: 4 for a kept day, 2 for
 * a partly kept one, 1 for a missed one, 0 where the rule asked nothing.
 */
export function recordWall({
  timeline,
  completions,
  today,
  days,
  contextFor,
}: {
  timeline: RuleSnapshot[]
  completions: { date: string; subId: string | null }[]
  today: string
  days: number
  contextFor: (date: Date) => ScheduleContext | undefined
}): { date: string; value: number }[] {
  const prayedBy = byDate(completions)
  const start = subDays(parseISO(today), days - 1)
  const value = { kept: 4, partial: 2, missed: 1, free: 0 }
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i)
    const date = format(d, 'yyyy-MM-dd')
    const keeping = keepingOn(timeline, date, prayedBy.get(date) ?? [], contextFor(d))
    // Today isn't missed until it's over.
    return { date, value: date === today && keeping !== 'kept' ? 0 : value[keeping] }
  })
}

/** A plan day on the fidelity wall. */
export const fidelity = { none: 0, prayed: 1, kept: 2, open: 3 } as const

/**
 * The whole plan's last `days` days, each judged against the rule in force on
 * it: kept when every essential time it owed was prayed, prayed when anything
 * was — a prayer outside the plan included — and none otherwise. Today stays
 * open until kept. `streak` counts the unbroken days with any prayer, through
 * yesterday while today is still unprayed; `prayedDays` of `countedDays` counts
 * from the window's start or the plan's first day, whichever is later.
 */
export function planFidelity({
  timelines,
  completions,
  today,
  days,
  contextFor,
}: {
  timelines: Map<string, RuleSnapshot[]>
  completions: { date: string; practiceId: string; subId: string | null }[]
  today: string
  days: number
  contextFor: (date: Date) => ScheduleContext | undefined
}): {
  wall: { date: string; value: number }[]
  streak: number
  prayedDays: number
  countedDays: number
} {
  const essentials = [...timelines].map(([practiceId, timeline]) => ({
    practiceId,
    timeline: timeline.map((s) => ({ ...s, slots: s.slots.filter((x) => x.tier === 'essential') })),
  }))
  const prayedBy = new Map<string, Map<string, string[]>>()
  for (const c of completions) {
    const day = prayedBy.get(c.date) ?? new Map<string, string[]>()
    day.set(c.practiceId, [...(day.get(c.practiceId) ?? []), c.subId ?? 'default'])
    prayedBy.set(c.date, day)
  }
  const firstDay = [
    ...[...timelines.values()].map((t) => t[0]?.date),
    ...completions.map((c) => c.date),
  ]
    .filter((d): d is string => d !== undefined)
    .sort()[0]

  const start = subDays(parseISO(today), days - 1)
  let prayedDays = 0
  let countedDays = 0
  const wall = Array.from({ length: days }, (_, i) => {
    const d = addDays(start, i)
    const date = format(d, 'yyyy-MM-dd')
    const prayed = prayedBy.get(date)
    const kept =
      prayed !== undefined &&
      essentials.every(({ practiceId, timeline }) => {
        const keeping = keepingOn(timeline, date, prayed.get(practiceId) ?? [], contextFor(d))
        return keeping === 'kept' || keeping === 'free'
      })
    if (firstDay && date >= firstDay && (date !== today || prayed)) {
      countedDays++
      if (prayed) prayedDays++
    }
    const value = kept ? fidelity.kept : prayed ? fidelity.prayed : fidelity.none
    return { date, value: date === today && !kept ? fidelity.open : value }
  })

  let streak = 0
  let d = parseISO(today)
  if (!prayedBy.has(today)) d = subDays(d, 1)
  while (prayedBy.has(format(d, 'yyyy-MM-dd'))) {
    streak++
    d = subDays(d, 1)
  }
  return { wall, streak, prayedDays, countedDays }
}

function byDate(completions: { date: string; subId: string | null }[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const c of completions) {
    const list = map.get(c.date) ?? []
    list.push(c.subId ?? 'default')
    map.set(c.date, list)
  }
  return map
}
