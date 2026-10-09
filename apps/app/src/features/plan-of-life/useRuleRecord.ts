import { useQuery } from '@tanstack/react-query'
import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from 'date-fns'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { getManifest } from '@/content/resolver'
import { resolveCompletions, useEventStore } from '@/db/events'
import type { AppEvent, StoredEvent } from '@/db/events/types'
import { getDb } from '@/db/instance'
import { useYearCalendar } from '@/features/calendar'
import { useMinuteOfDay } from '@/hooks/useCurrentHour'
import { useToday } from '@/hooks/useToday'
import { getCelebrationsForDate, getLiturgicalSeason } from '@/lib/liturgical'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

import { type ChronicleDay, type ChronicleProgram, chronicleDay } from './chronicle'
import { joinsRound, programDayDates, programRounds } from './program'
import { planFidelity, practiceRecord, recordWall, ruleTimeline, type TimedEvent } from './record'
import { parseSchedule } from './schedule'

const ruleEventTypes = [
  'PracticeCreated',
  'PracticeArchived',
  'PracticeUnarchived',
  'PracticeDeleted',
  'SlotAdded',
  'SlotUpdated',
  'SlotDeleted',
]

// The store keeps only the current rule, so its history comes from the event
// log's timestamps. `signature` changes whenever the rule does, to refetch.
function useRuleEvents(signature: string): TimedEvent[] | undefined {
  const { data } = useQuery({
    queryKey: ['ruleHistory', signature],
    queryFn: async () => {
      const placeholders = ruleEventTypes.map(() => '?').join(', ')
      const rows = await getDb().getAllAsync<Pick<StoredEvent, 'payload' | 'timestamp'>>(
        `SELECT payload, timestamp FROM events WHERE type IN (${placeholders}) ORDER BY sequence`,
        ruleEventTypes,
      )
      return rows.map((r) => ({ event: JSON.parse(r.payload) as AppEvent, timestamp: r.timestamp }))
    },
  })
  return data
}

// Schedules that follow the liturgical year (holy days, seasons) need the
// calendar of the day they're asked about.
function useContextFor() {
  const today = useToday()
  const { data: thisYear } = useYearCalendar(today.getFullYear())
  const { data: lastYear } = useYearCalendar(today.getFullYear() - 1)
  const transfers = useOfTransfers()
  return useMemo(
    () => (date: Date) => {
      const year = date.getFullYear() === today.getFullYear() ? thisYear : lastYear
      return {
        season: getLiturgicalSeason(date, 'of', transfers),
        dayCalendar: year ? getCelebrationsForDate(year, date) : undefined,
      }
    },
    [today, thisYear, lastYear, transfers],
  )
}

/**
 * The practice's record against its rule as it stood each day: how many times
 * it was prayed, since when without a lapse, and the constellation of the last
 * `wallDays`.
 */
export function useRuleRecord(practiceId: string, wallDays: number) {
  const todayKey = format(useToday(), 'yyyy-MM-dd')
  const contextFor = useContextFor()

  const ruleSignature = useEventStore((s) =>
    JSON.stringify([
      practiceId,
      s.practices.get(practiceId)?.archived,
      [...s.slots.values()].filter((slot) => slot.practice_id === practiceId),
    ]),
  )
  const events = useRuleEvents(ruleSignature)

  const { ids, all } = useEventStore(
    useShallow((s) => ({ ids: s.completionsByPractice.get(practiceId), all: s.completions })),
  )
  const completions = useMemo(
    () => resolveCompletions(ids, all).map((c) => ({ date: c.date, subId: c.sub_id })),
    [ids, all],
  )

  return useMemo(() => {
    if (!events) return undefined
    const timeline = ruleTimeline(practiceId, events)
    const args = { timeline, completions, today: todayKey, contextFor }
    return { ...practiceRecord(args), wall: recordWall({ ...args, days: wallDays }) }
  }, [events, practiceId, completions, todayKey, contextFor, wallDays])
}

/**
 * The whole plan's fidelity over the wall's `weeks` (Monday-aligned, as the
 * wall draws them): each day kept, prayed or empty, the streak of days with
 * prayer, and how many of the days counted had any.
 */
export function usePlanFidelity(weeks: number) {
  const today = useToday()
  const todayKey = format(today, 'yyyy-MM-dd')
  const contextFor = useContextFor()

  const ruleSignature = useEventStore((s) =>
    JSON.stringify([
      [...s.practices.values()].map((p) => [p.practice_id, p.archived]),
      [...s.slots.values()],
    ]),
  )
  const events = useRuleEvents(ruleSignature)
  const all = useEventStore((s) => s.completions)

  return useMemo(() => {
    if (!events) return undefined
    const practiceIds = new Set<string>()
    for (const { event } of events) if ('practiceId' in event) practiceIds.add(event.practiceId)
    const timelines = new Map([...practiceIds].map((id) => [id, ruleTimeline(id, events)]))
    const completions = [...all.values()].map((c) => ({
      date: c.date,
      practiceId: c.practice_id,
      subId: c.sub_id,
    }))
    const start = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 })
    const days = differenceInCalendarDays(today, start) + 1
    return planFidelity({ timelines, completions, today: todayKey, days, contextFor })
  }, [events, all, today, todayKey, weeks, contextFor])
}

/**
 * The chronicle, lazily: every date from today back to the first rule or
 * prayer, newest first, and `dayAt` to build one day against the plan as it
 * stood — its beads, the prayers beyond it, what began or ended. Days are built
 * only when asked for and kept; only today follows the clock.
 */
export function useChronicle():
  | { dates: string[]; dayAt: (date: string) => ChronicleDay }
  | undefined {
  const today = useToday()
  const todayKey = format(today, 'yyyy-MM-dd')
  const now = useMinuteOfDay()
  const contextFor = useContextFor()

  const { slots, practices, cursors, completions, completionsByPractice } = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      practices: s.practices,
      cursors: s.cursors,
      completions: s.completions,
      completionsByPractice: s.completionsByPractice,
    })),
  )
  const ruleSignature = useMemo(
    () =>
      JSON.stringify([
        [...practices.values()].map((p) => [p.practice_id, p.archived]),
        [...slots.values()],
      ]),
    [practices, slots],
  )
  const events = useRuleEvents(ruleSignature)

  const programs = useMemo(() => {
    const list: ChronicleProgram[] = []
    const ids = new Set([
      ...completionsByPractice.keys(),
      ...[...slots.values()].map((s) => s.practice_id),
    ])
    for (const practiceId of ids) {
      const program = getManifest(practiceId)?.program
      if (!program) continue
      // Only a program in the plan runs: a disabled or archived one has no days.
      const slot =
        practices.get(practiceId)?.archived === 1
          ? undefined
          : [...slots.values()].find((s) => s.practice_id === practiceId && s.enabled === 1)
      const dates = slot
        ? programDayDates({
            program,
            schedule: parseSchedule(slot.schedule),
            startedAt: cursors.get(`program/${practiceId}`)?.started_at,
            completionDatesAsc: [
              ...new Set(
                resolveCompletions(completionsByPractice.get(practiceId), completions).map(
                  (c) => c.date,
                ),
              ),
            ].sort(),
            today,
          })
        : []
      // Rounds since it was joined: one before that was never hers to miss.
      const joinedOn = cursors.get(`program/${practiceId}`)?.started_at ?? ''
      const rounds =
        slot && program.days
          ? programRounds(program, today)
              .filter((r) => joinsRound(parseSchedule(slot.schedule), r))
              .filter((r) => (r.days.at(-1) as string) >= joinedOn)
              .map((r) => r.days)
          : undefined
      list.push({ practiceId, time: slot?.time ?? null, dates, rounds })
    }
    return list
  }, [slots, practices, cursors, completions, completionsByPractice, today])

  const base = useMemo(() => {
    if (!events) return undefined
    const programIds = new Set(programs.map((p) => p.practiceId))
    const practiceIds = new Set<string>()
    for (const { event } of events) {
      if ('practiceId' in event && !programIds.has(event.practiceId)) {
        practiceIds.add(event.practiceId)
      }
    }
    // A practice never enabled in the plan asks nothing of any day.
    const timelines = new Map(
      [...practiceIds]
        .map((id) => [id, ruleTimeline(id, events)] as const)
        .filter(([, timeline]) => timeline.some((s) => s.slots.length > 0)),
    )
    const byDate = new Map<
      string,
      { practiceId: string; subId: string | null; completedAt: number }[]
    >()
    for (const c of completions.values()) {
      const list = byDate.get(c.date) ?? []
      list.push({ practiceId: c.practice_id, subId: c.sub_id, completedAt: c.completed_at })
      byDate.set(c.date, list)
    }
    const first = [format(events[0]?.timestamp ?? today, 'yyyy-MM-dd'), ...byDate.keys()].sort()[0]
    const length = Math.max(differenceInCalendarDays(today, parseISO(first ?? todayKey)) + 1, 1)
    const dates = Array.from({ length }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'))
    const build = (date: string, minute: number) =>
      chronicleDay({
        date,
        timelines,
        programs,
        completions: byDate.get(date) ?? [],
        today: todayKey,
        now: minute,
        contextFor,
      })
    return { dates, build, cache: new Map<string, ChronicleDay>() }
  }, [events, programs, completions, today, todayKey, contextFor])

  return useMemo(() => {
    if (!base) return undefined
    const { dates, build, cache } = base
    const dayAt = (date: string) => {
      if (date === todayKey) return build(date, now)
      const cached = cache.get(date)
      if (cached) return cached
      const day = build(date, now)
      cache.set(date, day)
      return day
    }
    return { dates, dayAt }
  }, [base, todayKey, now])
}
