import { format, parseISO, subDays } from 'date-fns'

import type { TimeBlock } from '@/db/schema'

import { type RuleSnapshot, snapshotAt } from './record'
import { isApplicableOn, type ScheduleContext } from './schedule'
import { dayMinutes } from './timeBlocks'

/** One bead on a day's string: a time the day's plan asked for. */
export type ChronicleBead = {
  practiceId: string
  time: string | null
  kind: 'rule' | 'program'
  /** The program's day this date fell on, 1-based; absent for an earlier run. */
  programDay?: number
  state: 'kept' | 'missed' | 'ahead'
}

/** A prayer said beyond the day's plan. */
export type ChronicleExtra = { practiceId: string; completedAt: number }

export type ChronicleNote = {
  kind: 'joined' | 'programBegan' | 'programEnded'
  practiceId: string
}

export type ChronicleDay = {
  date: string
  beads: ChronicleBead[]
  extras: ChronicleExtra[]
  notes: ChronicleNote[]
}

/** A program's current run: the date each of its days falls on. */
export type ChronicleProgram = {
  practiceId: string
  time: string | null
  dates: (string | undefined)[]
}

type DayCompletion = { practiceId: string; subId: string | null; completedAt: number }

// Where a time-less slot sits among timed ones: at its block's opening.
const blockMinutes: Record<TimeBlock, number> = {
  morning: dayMinutes('06:00'),
  daytime: dayMinutes('12:00'),
  evening: dayMinutes('18:00'),
  flexible: dayMinutes('23:59'),
}

function minutesOf(time: string | null, block: TimeBlock = 'flexible'): number {
  return time ? dayMinutes(time) : blockMinutes[block]
}

/**
 * A day against the plan as it stood that day. Each practice's rule is the one
 * in force on the date; a time added that same day shows only if prayed, as
 * `keepingOn` counts it. A completion outside any due time of its practice
 * fills that practice's unkept time before it counts as extra. A program shows
 * on the dates its current run gives it, or where an earlier run was prayed.
 * Today, a time still ahead is `ahead`, not missed.
 */
export function chronicleDay({
  date,
  timelines,
  programs,
  completions,
  today,
  now,
  contextFor,
}: {
  date: string
  timelines: Map<string, RuleSnapshot[]>
  programs: ChronicleProgram[]
  completions: DayCompletion[]
  today: string
  /** Minutes since local midnight. */
  now: number
  contextFor: (date: Date) => ScheduleContext | undefined
}): ChronicleDay {
  const day = parseISO(date)
  const previous = format(subDays(day, 1), 'yyyy-MM-dd')
  const ctx = contextFor(day)
  const unkept = (time: string | null, block?: TimeBlock): ChronicleBead['state'] =>
    date === today && minutesOf(time, block) > dayMinutes(now) ? 'ahead' : 'missed'

  const remaining = [...completions].sort((a, b) => a.completedAt - b.completedAt)
  const take = (match: (c: DayCompletion) => boolean) => {
    const i = remaining.findIndex(match)
    return i === -1 ? undefined : remaining.splice(i, 1)[0]
  }

  const placed: (ChronicleBead & { minutes: number })[] = []
  const notes: ChronicleNote[] = []
  const firstDay = [...timelines.values()]
    .map((t) => t[0]?.date)
    .filter(Boolean)
    .sort()[0]

  for (const [practiceId, timeline] of timelines) {
    const dueIn = (s: RuleSnapshot | undefined) =>
      (s?.slots ?? []).filter((slot) => isApplicableOn(slot.schedule, day, ctx))
    const due = dueIn(snapshotAt(timeline, date)).sort(
      (a, b) => minutesOf(a.time, a.timeBlock) - minutesOf(b.time, b.timeBlock),
    )
    const before = snapshotAt(timeline, previous)
    const owed = new Set(dueIn(before).map((s) => s.id))
    const dueIds = new Set(due.map((s) => s.id))
    const kept = new Set(
      due
        .filter((s) => take((c) => c.practiceId === practiceId && c.subId === s.id))
        .map((s) => s.id),
    )
    for (const slot of due) {
      if (kept.has(slot.id)) continue
      const spare = take((c) => c.practiceId === practiceId && !dueIds.has(c.subId ?? 'default'))
      if (spare) kept.add(slot.id)
    }
    for (const slot of due) {
      if (!kept.has(slot.id) && !owed.has(slot.id)) continue
      placed.push({
        practiceId,
        time: slot.time,
        kind: 'rule',
        state: kept.has(slot.id) ? 'kept' : unkept(slot.time, slot.timeBlock),
        minutes: minutesOf(slot.time, slot.timeBlock),
      })
    }
    const joined = (snapshotAt(timeline, date)?.slots.length ?? 0) > 0 && !before?.slots.length
    if (joined && firstDay && date > firstDay) notes.push({ kind: 'joined', practiceId })
  }

  if (date <= today) {
    for (const { practiceId, time, dates } of programs) {
      const index = dates.indexOf(date)
      const prayed = take((c) => c.practiceId === practiceId)
      if (index === -1 && !prayed) continue
      placed.push({
        practiceId,
        time,
        kind: 'program',
        programDay: index === -1 ? undefined : index + 1,
        state: prayed ? 'kept' : unkept(time),
        minutes: minutesOf(time),
      })
      // A program that waits for its prayers only projects its days: it begins
      // when its first is prayed, and its last ends it once prayed or past.
      if (index === 0 && prayed) notes.push({ kind: 'programBegan', practiceId })
      if (index !== -1 && index === dates.length - 1 && (prayed || date < today)) {
        notes.push({ kind: 'programEnded', practiceId })
      }
    }
  }

  placed.sort((a, b) => a.minutes - b.minutes)
  return {
    date,
    beads: placed.map(({ minutes: _, ...bead }) => bead),
    extras: remaining.map(({ practiceId, completedAt }) => ({ practiceId, completedAt })),
    notes,
  }
}
