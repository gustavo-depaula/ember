import { massVersion } from '@ember/divinum-officium'
import {
  type DayCalendar,
  getCelebrationsForDate,
  type ResolvedCelebration,
} from '@ember/liturgical'
import { buildOfYearCalendar } from '@ember/mass'
import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, format } from 'date-fns'
import { useMemo } from 'react'
import { useToday } from '@/hooks/useToday'
import { loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'
import { createCorpusDoLoader } from '@/sources/divinum-officium/loader'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { buildDoYearCalendar } from './buildDoYearCalendar'

// Both display calendars (home card + month grid) are now resolved from the
// *same* canonical authority the Mass uses, so card and Mass can never disagree:
// OF via @ember/mass's buildOfYearCalendar (resolveOfDay over the MR statics),
// EF via buildDoYearCalendar (the Divinum Officium engine, the EF Mass/Office's
// own day resolution — transfers, octaves, vigils, commemorations all match).
export function useYearCalendar(year?: number) {
  const form = usePreferencesStore((s) => s.liturgicalCalendar)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const doVersion = usePreferencesStore((s) => s.doVersion)
  const today = useToday()
  const resolvedYear = year ?? today.getFullYear()

  return useQuery({
    queryKey: ['calendar', resolvedYear, form, contentLanguage, doVersion],
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
      return buildDoYearCalendar({
        year: resolvedYear,
        loader: createCorpusDoLoader(),
        version: massVersion(doVersion),
      })
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
