import type { LiturgicalEntry } from '@ember/liturgical'
import {
  buildYearCalendar,
  type DayCalendar,
  getCelebrationsForDate,
  type ResolvedCelebration,
} from '@ember/liturgical'
import { buildOfYearCalendar } from '@ember/mass'
import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { useMemo } from 'react'
import { useToday } from '@/hooks/useToday'
import { fetchHearth } from '@/lib/hearth'
import { loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'
import { usePreferencesStore } from '@/stores/preferencesStore'

// The OF display calendar (home card + month grid) is now resolved from the
// *same* canonical MR authority the Mass uses — `resolveOfDay` over
// `content/of/calendar/*`, via @ember/mass's buildOfYearCalendar — so the two can
// never disagree (Sacred Heart, Corpus Christi, transferred Ascension all show).
// The EF display calendar still uses the curated entries.json (its EF half).
function fetchLiturgicalEntries(): Promise<LiturgicalEntry[]> {
  return fetchHearth<LiturgicalEntry[]>('liturgical/entries.json')
}

export function useYearCalendar(year?: number) {
  const form = usePreferencesStore((s) => s.liturgicalCalendar)
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const today = useToday()
  const resolvedYear = year ?? today.getFullYear()

  return useQuery({
    queryKey: ['calendar', resolvedYear, form, jurisdiction, contentLanguage],
    queryFn: async () => {
      if (form === 'of') {
        const statics = await loadOfCalendar()
        if (!statics) return new Map<string, DayCalendar>()
        return buildOfYearCalendar({
          year: resolvedYear,
          statics,
          scope: scopeForContentLang(contentLanguage),
        })
      }
      const entries = await fetchLiturgicalEntries()
      return buildYearCalendar({ year: resolvedYear, form, entries, jurisdiction })
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useTodayCelebration(): DayCalendar | undefined {
  const today = useToday()
  const todayKey = format(today, 'yyyy-MM-dd')
  const { data: calendar } = useYearCalendar(today.getFullYear())
  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  return useMemo(
    () => (calendar ? getCelebrationsForDate(calendar, today) : undefined),
    [calendar, todayKey],
  )
}

export function useMonthCelebrationMap(year: number, month: number): Map<string, DayCalendar> {
  const { data: calendar } = useYearCalendar(year)
  return useMemo(() => {
    if (!calendar) return new Map<string, DayCalendar>()
    const map = new Map<string, DayCalendar>()
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const entry = getCelebrationsForDate(calendar, date)
      if (entry) map.set(format(date, 'yyyy-MM-dd'), entry)
    }
    return map
  }, [calendar, year, month])
}

export function useUpcomingCelebration(days = 14): ResolvedCelebration | undefined {
  const today = useToday()
  const todayKey = format(today, 'yyyy-MM-dd')
  const currentYear = today.getFullYear()
  const needsNextYear = today.getMonth() === 11 && today.getDate() > 31 - days
  const { data: calendar } = useYearCalendar(currentYear)
  const { data: nextYearCalendar } = useYearCalendar(needsNextYear ? currentYear + 1 : currentYear)

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by calendar day string
  return useMemo(() => {
    if (!calendar) return undefined

    let closest: { celebration: ResolvedCelebration; daysUntil: number } | undefined

    for (let i = 1; i <= days; i++) {
      const date = addDays(today, i)
      const cal = date.getFullYear() > currentYear ? nextYearCalendar : calendar
      if (!cal) continue
      const day = getCelebrationsForDate(cal, date)
      if (!day?.principal) continue

      const rank = day.principal.rank
      const isMajor =
        rank === 'solemnity' || rank === 'feast' || rank === 'I_class' || rank === 'II_class'
      if (!isMajor) continue

      const daysUntil = differenceInCalendarDays(date, today)
      if (!closest || daysUntil < closest.daysUntil) {
        closest = { celebration: day.principal, daysUntil }
      }
    }

    return closest?.celebration
  }, [calendar, nextYearCalendar, todayKey, days])
}
