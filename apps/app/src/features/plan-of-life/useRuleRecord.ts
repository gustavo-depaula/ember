import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { resolveCompletions, useEventStore } from '@/db/events'
import type { AppEvent, StoredEvent } from '@/db/events/types'
import { getDb } from '@/db/instance'
import { useYearCalendar } from '@/features/calendar'
import { useToday } from '@/hooks/useToday'
import {
  getCelebrationsForDate,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { practiceRecord, recordWall, ruleTimeline } from './record'

const ruleEventTypes = [
  'PracticeCreated',
  'PracticeArchived',
  'PracticeUnarchived',
  'PracticeDeleted',
  'SlotAdded',
  'SlotUpdated',
  'SlotDeleted',
]

/**
 * The practice's record against its rule as it stood each day: how many times
 * it was prayed, since when without a lapse, and the constellation of the last
 * `wallDays`. The store keeps only the current rule, so the history comes from
 * the event log's timestamps.
 */
export function useRuleRecord(practiceId: string, wallDays: number) {
  const today = useToday()
  const todayKey = format(today, 'yyyy-MM-dd')
  const form = usePreferencesStore((s) => s.liturgicalCalendar) as LiturgicalCalendarForm
  const { data: thisYear } = useYearCalendar(today.getFullYear())
  const { data: lastYear } = useYearCalendar(today.getFullYear() - 1)

  // Refetch the log whenever the practice's rule changes in the store.
  const ruleSignature = useEventStore((s) =>
    JSON.stringify([
      s.practices.get(practiceId)?.archived,
      [...s.slots.values()].filter((slot) => slot.practice_id === practiceId),
    ]),
  )
  const { data: events } = useQuery({
    queryKey: ['ruleHistory', practiceId, ruleSignature],
    queryFn: async () => {
      const placeholders = ruleEventTypes.map(() => '?').join(', ')
      const rows = await getDb().getAllAsync<Pick<StoredEvent, 'payload' | 'timestamp'>>(
        `SELECT payload, timestamp FROM events WHERE type IN (${placeholders}) ORDER BY sequence`,
        ruleEventTypes,
      )
      return rows.map((r) => ({ event: JSON.parse(r.payload) as AppEvent, timestamp: r.timestamp }))
    },
  })

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
    const contextFor = (date: Date) => {
      const year = date.getFullYear() === today.getFullYear() ? thisYear : lastYear
      return {
        season: getLiturgicalSeason(date, form),
        dayCalendar: year ? getCelebrationsForDate(year, date) : undefined,
      }
    }
    const args = { timeline, completions, today: todayKey, contextFor }
    return { ...practiceRecord(args), wall: recordWall({ ...args, days: wallDays }) }
  }, [events, practiceId, completions, todayKey, today, thisYear, lastYear, form, wallDays])
}
