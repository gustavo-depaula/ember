import type { ServiceKind } from '@ember/api'
import type { TFunction } from 'i18next'

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

export function formatTimeOfDay(startTime: string, locale: string): string {
  const [h, m] = startTime.split(':').map(Number)
  const d = new Date(Date.UTC(2000, 0, 1, h || 0, m || 0))
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

// Relative day word for an occurrence: Today / Tomorrow / weekday / dated. `now` is the church's
// wall clock (wallClockNow), so "today" means today where the church is.
export function dayLabel(occurrenceDate: Date, now: Date, t: TFunction, locale: string): string {
  const startOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const diff = Math.round((startOf(occurrenceDate) - startOf(now)) / dayMs)
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

export function kindLabel(kind: ServiceKind, t: TFunction): string {
  return t(`massTimes.kind.${kind}`)
}
