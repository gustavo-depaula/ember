import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, format, startOfWeek, subWeeks } from 'date-fns'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { resolveCompletions, useEventStore } from '@/db/events'
import type { AppEvent, StoredEvent } from '@/db/events/types'
import { getDb } from '@/db/instance'
import { useYearCalendar } from '@/features/calendar'
import { useToday } from '@/hooks/useToday'
import { getCelebrationsForDate, getLiturgicalSeason } from '@/lib/liturgical'

import { planFidelity, practiceRecord, recordWall, ruleTimeline, type TimedEvent } from './record'

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
  return useMemo(
    () => (date: Date) => {
      const year = date.getFullYear() === today.getFullYear() ? thisYear : lastYear
      return {
        season: getLiturgicalSeason(date),
        dayCalendar: year ? getCelebrationsForDate(year, date) : undefined,
      }
    },
    [today, thisYear, lastYear],
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
