import { type DayObligations, getDayObligations } from '@ember/liturgical'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { useYearCalendar } from '@/features/calendar'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function useObligations(date: Date): DayObligations | undefined {
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  const transfers = useOfTransfers()
  const { data: calendar } = useYearCalendar(date.getFullYear())
  const dateKey = format(date, 'yyyy-MM-dd')

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  return useMemo(() => {
    if (!calendar) return undefined
    return getDayObligations(date, 'of', jurisdiction, calendar, transfers)
  }, [calendar, dateKey, jurisdiction, transfers])
}
