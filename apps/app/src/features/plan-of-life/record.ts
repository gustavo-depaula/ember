import { addDays, format, parseISO, subDays } from 'date-fns'
import type { WritableDraft } from 'immer'

import { pinsAgree } from '@/content/pins'
import type { EventStoreState } from '@/db/events'
import { applyEvent } from '@/db/events/projections'
import type { SlotState } from '@/db/events/state'
import type { AppEvent } from '@/db/events/types'
import type { Tier, TimeBlock } from '@/db/schema'
import { parseSlotKey } from '@/lib/slotKey'

import { isApplicableOn, parseSchedule, type Schedule, type ScheduleContext } from './schedule'

export type TimedEvent = { event: AppEvent; timestamp: number }

/** The practice's rule as it stood at the end of `date`: its enabled times. */
export type RuleSnapshot = {
  date: string
  slots: {
    id: string
    schedule: Schedule
    tier: Tier
    time: string | null
    timeBlock: TimeBlock
    pins?: Record<string, string>
  }[]
}

/** A completion as the record reads it: the slot it was filed on, the choices prayed. */
export type Prayed = { subId: string | null; pins?: Record<string, string> }

type DayKeeping = 'kept' | 'missed' | 'partial' | 'free'

/**
 * Every practice's rule history, one snapshot per day it changed, replayed
 * through the store's own projection so archive, unarchive, slot edits and
 * merges mean here exactly what they mean in the plan. A practice merged into
 * another is filed under the id it ended with, as its completions are, so the
 * days before the merge ask for what was prayed under the old id.
 */
export function ruleTimelines(events: TimedEvent[]): Map<string, RuleSnapshot[]> {
  const state = {
    practices: new Map(),
    slots: new Map(),
    completions: new Map(),
    completionsByDate: new Map(),
    completionsByPractice: new Map(),
    cursors: new Map(),
  } as unknown as WritableDraft<EventStoreState>
  // The projection moves a merged slot by renaming it in place, so a capture
  // that holds the slot itself reads its final key once the log is replayed.
  type Captured = { date: string; slots: { slot: SlotState; fields: SnapshotSlotFields }[] }
  const captured = new Map<string, Captured[]>()
  const mergedInto = new Map<string, string>()

  for (const { event, timestamp } of events) {
    const touched = practicesOf(event)
    if (touched.length === 0) continue
    applyEvent(state, event)
    if (event.type === 'PracticeMerged') mergedInto.set(event.fromId, event.toId)
    const date = format(timestamp, 'yyyy-MM-dd')
    for (const practiceId of touched) {
      const archived = state.practices.get(practiceId)?.archived === 1
      const slots = archived
        ? []
        : [...state.slots.values()]
            .filter((s) => s.practice_id === practiceId && s.enabled === 1)
            .map((slot) => ({
              slot,
              fields: {
                schedule: parseSchedule(slot.schedule),
                tier: slot.tier,
                time: slot.time,
                timeBlock: slot.time_block,
                pins: slot.pins,
              },
            }))
      const days = captured.get(practiceId) ?? []
      if (days.at(-1)?.date === date) days[days.length - 1] = { date, slots }
      else days.push({ date, slots })
      captured.set(practiceId, days)
    }
  }

  const finalId = (practiceId: string) => {
    let id = practiceId
    for (let hops = 0; mergedInto.has(id) && hops < mergedInto.size; hops++) {
      id = mergedInto.get(id) as string
    }
    return id
  }
  const sources = new Map<string, Captured[][]>()
  for (const [practiceId, days] of captured) {
    const id = finalId(practiceId)
    sources.set(id, [...(sources.get(id) ?? []), days])
  }

  // A practice and those merged into it each hold their own slots until the
  // merge; the plan on a day had all of them.
  const timelines = new Map<string, RuleSnapshot[]>()
  for (const [practiceId, parts] of sources) {
    const dates = [...new Set(parts.flatMap((days) => days.map((d) => d.date)))].sort()
    timelines.set(
      practiceId,
      dates.map((date) => ({
        date,
        slots: parts.flatMap((days) =>
          (snapshotAt(days, date)?.slots ?? []).map(({ slot, fields }) => ({
            id: parseSlotKey(slot.id).slotId,
            ...fields,
          })),
        ),
      })),
    )
  }
  return timelines
}

/** One practice's rule history; see `ruleTimelines`. */
export function ruleTimeline(practiceId: string, events: TimedEvent[]): RuleSnapshot[] {
  return ruleTimelines(events).get(practiceId) ?? []
}

type SnapshotSlotFields = Omit<RuleSnapshot['slots'][number], 'id'>

function practicesOf(event: AppEvent): string[] {
  if (event.type.startsWith('Completion')) return []
  if (event.type === 'PracticeMerged') return [event.fromId, event.toId]
  if ('practiceId' in event) return [event.practiceId]
  if (event.type === 'SlotUpdated') return [parseSlotKey(event.slotKey).practiceId]
  return []
}

export function snapshotAt<T extends { date: string }>(timeline: T[], date: string): T | undefined {
  let found: T | undefined
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
 * any due time (prayed from the library, say) stand in for a due one, unless
 * it pins another choice than the one prayed.
 */
function keepingOn(
  timeline: RuleSnapshot[],
  date: string,
  prayed: Prayed[],
  ctx: ScheduleContext | undefined,
): DayKeeping {
  const day = parseISO(date)
  const dueIn = (s: RuleSnapshot | undefined) =>
    (s?.slots ?? []).filter((slot) => isApplicableOn(slot.schedule, day, ctx))
  const dueByEnd = dueIn(snapshotAt(timeline, date))
  if (dueByEnd.length === 0) return 'free'
  const owed = new Set(
    dueIn(snapshotAt(timeline, format(subDays(day, 1), 'yyyy-MM-dd'))).map((s) => s.id),
  )
  const required = dueByEnd.filter((s) => owed.has(s.id))
  if (required.length === 0) return prayed.length > 0 ? 'kept' : 'free'

  const filedOn = new Set(prayed.map((p) => p.subId ?? 'default'))
  const spare = prayed.filter((p) => !dueByEnd.some((s) => s.id === (p.subId ?? 'default')))
  const kept = required.filter((slot) => {
    if (filedOn.has(slot.id)) return true
    const i = spare.findIndex((p) => pinsAgree(slot.pins, p.pins))
    if (i === -1) return false
    spare.splice(i, 1)
    return true
  }).length
  if (kept >= required.length) return 'kept'
  return kept > 0 ? 'partial' : 'missed'
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
  completions: ({ date: string } & Prayed)[]
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
  completions: ({ date: string } & Prayed)[]
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
  completions: ({ date: string; practiceId: string } & Prayed)[]
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
  const prayedBy = new Map<string, Map<string, Prayed[]>>()
  for (const c of completions) {
    const day = prayedBy.get(c.date) ?? new Map<string, Prayed[]>()
    day.set(c.practiceId, [...(day.get(c.practiceId) ?? []), c])
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

function byDate(completions: ({ date: string } & Prayed)[]): Map<string, Prayed[]> {
  const map = new Map<string, Prayed[]>()
  for (const c of completions) {
    const list = map.get(c.date) ?? []
    list.push(c)
    map.set(c.date, list)
  }
  return map
}
