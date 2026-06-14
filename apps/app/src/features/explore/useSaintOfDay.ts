import { format } from 'date-fns'
import { useMemo } from 'react'

import { useYearCalendar } from '@/features/calendar'
import { useToday } from '@/hooks/useToday'
import { getCelebrationsForDate, type ResolvedCelebration } from '@/lib/liturgical'

export type SaintOfDay = {
  celebration: ResolvedCelebration
}

/**
 * The day's principal liturgical celebration. Returns undefined while the
 * calendar warms or when the day has no principal celebration. Mirrors
 * {@link CelebrationOfDay}'s memo-by-date-string so the live `useToday()` clock
 * doesn't thrash the result.
 */
export function useSaintOfDay(): SaintOfDay | undefined {
  const today = useToday()
  const dateKey = format(today, 'yyyy-MM-dd')
  const { data: calendar } = useYearCalendar(today.getFullYear())

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  return useMemo(() => {
    if (!calendar) return undefined
    const principal = getCelebrationsForDate(calendar, today)?.principal
    if (!principal) return undefined
    return { celebration: principal }
  }, [calendar, dateKey])
}
