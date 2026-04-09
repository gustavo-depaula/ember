import { format } from 'date-fns'
import type {
  CalendarOptions,
  DayCalendar,
  LiturgicalDate,
  LiturgicalEntry,
  ResolvedCelebration,
} from './calendar-types'
import { applySundaySuppression, sortByPrecedence } from './precedence'
import { computeAnchors, resolveDate } from './resolve-date'
import { getLiturgicalSeason } from './season'

function addToMap(map: Map<string, DayCalendar>, celebration: ResolvedCelebration) {
  const key = format(celebration.date, 'yyyy-MM-dd')
  const existing = map.get(key)
  if (existing) {
    existing.celebrations.push(celebration)
  } else {
    map.set(key, {
      date: celebration.date,
      celebrations: [celebration],
      principal: undefined,
    })
  }
}

function resolveEntry(
  entry: LiturgicalEntry,
  form: 'of' | 'ef',
  year: number,
  anchors: ReturnType<typeof computeAnchors>,
  jurisdiction?: string,
): ResolvedCelebration | undefined {
  const formData = form === 'of' ? entry.of : entry.ef
  const override = jurisdiction
    ? entry.overrides?.find((o) => o.jurisdiction === jurisdiction)
    : undefined

  let rank: ResolvedCelebration['rank'] | undefined
  let litDate: LiturgicalDate | undefined

  if (override) {
    const overrideRank = form === 'of' ? override.rankOF : override.rankEF
    const overrideDate = form === 'of' ? override.dateOF : override.dateEF

    if (override.isProper && !formData) {
      // Jurisdiction-only entry (e.g., Our Lady of Aparecida in Brazil)
      if (!overrideRank || !overrideDate) return undefined
      rank = overrideRank
      litDate = overrideDate
    } else if (formData) {
      rank = overrideRank ?? formData.rank
      litDate = overrideDate ?? formData.date
    } else {
      return undefined
    }
  } else if (formData) {
    rank = formData.rank
    litDate = formData.date
  } else {
    return undefined
  }

  if (!rank || !litDate) return undefined
  const resolved = resolveDate(litDate, year, anchors)
  if (!resolved) return undefined

  return { entry, date: resolved, rank, form }
}

export function buildYearCalendar(options: CalendarOptions): Map<string, DayCalendar> {
  const { year, form, entries, jurisdiction } = options
  const anchors = computeAnchors(year)
  const map = new Map<string, DayCalendar>()

  for (const entry of entries) {
    const celebration = resolveEntry(entry, form, year, anchors, jurisdiction)
    if (celebration) addToMap(map, celebration)
  }

  // Sort by precedence and apply Sunday suppression
  for (const [key, day] of map) {
    const isSunday = day.date.getDay() === 0
    const season = getLiturgicalSeason(day.date, form)
    const sorted = sortByPrecedence(day.celebrations)
    const filtered = applySundaySuppression(sorted, season, isSunday)
    map.set(key, {
      date: day.date,
      celebrations: sorted,
      principal: filtered[0],
    })
  }

  return map
}

export function getCelebrationsForDate(
  calendar: Map<string, DayCalendar>,
  date: Date,
): DayCalendar | undefined {
  return calendar.get(format(date, 'yyyy-MM-dd'))
}
