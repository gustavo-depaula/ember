import type { ServiceKind } from '@ember/api'
import type { TFunction } from 'i18next'
import type { OtherRule } from '@/lib/mass-times'

// Display helpers for the Mass Times screens. Times are wall-clock strings and occurrence days are
// UTC-midnight Dates (see lib/mass-times/schedule.ts), so every Intl call here pins `timeZone: 'UTC'`
// to read those values verbatim — never re-shifting them into the device's zone.

const dayMs = 86_400_000

// Fixed liturgical order for the three service kinds, shared by every screen that lists them.
export const serviceKindOrder: ServiceKind[] = ['mass', 'confession', 'adoration']

export function formatDistanceKm(km: number, locale: string): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  const value = km < 10 ? km.toFixed(1) : Math.round(km).toString()
  return `${new Intl.NumberFormat(locale).format(Number(value))} km`
}

// Always the 24-hour clock, as parish bulletins print it: "16:00", never "4:00 PM" — a 12-hour time
// doubles the width of the list's time column and of the next-Mass headline.
export function formatTimeOfDay(startTime: string): string {
  const [h, m] = startTime.split(':').map(Number)
  return `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
}

// Relative day word for an occurrence: Today / Tomorrow / weekday / dated. `now` is the church's
// wall clock (wallClockNow), so "today" means today where the church is.
export function dayLabel(occurrenceDate: Date, now: Date, t: TFunction, locale: string): string {
  const diff = daysAway(occurrenceDate, now)
  if (diff <= 0) return t('massTimes.today')
  if (diff === 1) return t('massTimes.tomorrow')
  if (diff < 7)
    return occurrenceDate.toLocaleDateString(locale, { weekday: 'long', timeZone: 'UTC' })
  return occurrenceDate.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

// Whole days from `now` to an occurrence day; 0 (or less, for an occurrence already under way) is today.
export function daysAway(occurrenceDate: Date, now: Date): number {
  const startOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return Math.round((startOf(occurrenceDate) - startOf(now)) / dayMs)
}

// dayLabel cut to fit under a time in the list's time column: Today / Tomorrow / "thu" / "9 Oct".
export function shortDayLabel(
  occurrenceDate: Date,
  now: Date,
  t: TFunction,
  locale: string,
): string {
  const diff = daysAway(occurrenceDate, now)
  if (diff <= 0) return t('massTimes.today')
  if (diff === 1) return t('massTimes.tomorrow')
  if (diff < 7)
    return occurrenceDate.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
  return occurrenceDate.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function kindLabel(kind: ServiceKind, t: TFunction): string {
  return t(`massTimes.kind.${kind}`)
}

// The locale's own weekday name for a day of week (0 = Sunday) — lowercase mid-sentence in Portuguese,
// capitalized in English. 2023-01-01 was a Sunday.
function localWeekday(dow: number, locale: string, style: 'long' | 'short'): string {
  return new Date(Date.UTC(2023, 0, 1 + dow)).toLocaleDateString(locale, {
    weekday: style,
    timeZone: 'UTC',
  })
}

// A weekday heading a row or line, capitalized in every locale.
export function weekdayName(dow: number, locale: string, style: 'long' | 'short' = 'long'): string {
  return capitalize(localWeekday(dow, locale, style))
}

function monthName(month: number, locale: string): string {
  return new Date(Date.UTC(2023, month - 1, 1)).toLocaleDateString(locale, {
    month: 'short',
    timeZone: 'UTC',
  })
}

// A rule the weekly grid can't hold, as one line: "1st Friday of the month", "Sunday in Feb, Mar".
export function describeOtherRule(rule: OtherRule, t: TFunction, locale: string): string {
  if (rule.kind === 'monthly') {
    const weekdays = rule.weekdays
      .map(({ n, dow }) => {
        // sábado/domingo take the masculine ordinal in Portuguese.
        const group = dow === 0 || dow === 6 ? 'ordinalMasc' : 'ordinal'
        const day = localWeekday(dow, locale, 'long')
        return `${t(`massTimes.${group}.${n}`)} ${day}`
      })
      .join(', ')
    return t('massTimes.monthlyRule', { weekdays: capitalize(weekdays) })
  }
  return t('massTimes.seasonalRule', {
    days: rule.dows.map((dow) => weekdayName(dow, locale)).join(', '),
    months: rule.months.map((m) => monthName(m, locale)).join(', '),
  })
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
