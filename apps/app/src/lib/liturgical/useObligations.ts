import { type DayObligations, getDayObligations } from '@ember/liturgical'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useYearCalendar } from '@/features/calendar'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function useObligations(date: Date): DayObligations | undefined {
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  const { data: calendar } = useYearCalendar(date.getFullYear())
  const dateKey = format(date, 'yyyy-MM-dd')

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  return useMemo(() => {
    if (!calendar) return undefined
    return getDayObligations(date, 'of', jurisdiction, calendar)
  }, [calendar, dateKey, jurisdiction])
}
