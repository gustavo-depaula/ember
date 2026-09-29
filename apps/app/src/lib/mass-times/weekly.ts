// A church's standing schedule for one service kind, read the way a parish bulletin prints it: one
// row per weekday with that day's times, plus the rules a week can't hold (first Fridays, Lent-only
// Masses) set apart. Built straight from the rrules rather than from expanded occurrences, so the
// grid never depends on how many occurrences were expanded or on today's date.

import type { Service, ServiceKind } from '@ember/api'

// Day of week, 0 = Sunday (Date.getUTCDay order).
const byDayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

export type WeeklyDay = { dow: number; times: string[] }

export type OtherRule =
  | { kind: 'monthly'; weekdays: Array<{ n: number; dow: number }>; startTime: string }
  | { kind: 'seasonal'; dows: number[]; months: number[]; startTime: string }

export type WeeklySchedule = { days: WeeklyDay[]; other: OtherRule[] }

function parts(rrule: string): Record<string, string> {
  return Object.fromEntries(
    rrule.split(';').map((part) => part.split('=') as [string, string]),
  ) as Record<string, string>
}

export function weeklySchedule(services: Service[], kind: ServiceKind): WeeklySchedule {
  const times = new Map<number, Set<string>>()
  const other: OtherRule[] = []

  for (const service of services) {
    if (service.kind !== kind) continue
    const rule = parts(service.rrule)
    const byDay = (rule.BYDAY ?? '').split(',').filter(Boolean)

    if (rule.FREQ === 'MONTHLY') {
      const weekdays = byDay.flatMap((token) => {
        const match = /^([+-]?\d)([A-Z]{2})$/.exec(token)
        const dow = match ? byDayCodes.indexOf(match[2]) : -1
        return match && dow >= 0 ? [{ n: Number(match[1]), dow }] : []
      })
      if (weekdays.length) other.push({ kind: 'monthly', weekdays, startTime: service.startTime })
      continue
    }

    if (rule.FREQ !== 'WEEKLY' || (rule.INTERVAL && rule.INTERVAL !== '1')) continue
    const dows = byDay.map((code) => byDayCodes.indexOf(code)).filter((d) => d >= 0)
    if (rule.BYMONTH) {
      const months = rule.BYMONTH.split(',').map(Number)
      other.push({ kind: 'seasonal', dows, months, startTime: service.startTime })
      continue
    }
    for (const dow of dows) {
      const day = times.get(dow) ?? new Set<string>()
      day.add(service.startTime)
      times.set(dow, day)
    }
  }

  const days = [...times.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dow, set]) => ({ dow, times: [...set].sort(byClock) }))
  return { days, other }
}

// 'HH:MM' strings sort as clock times once the hour is zero-padded ('7:00' vs '12:15').
function byClock(a: string, b: string): number {
  return a.padStart(5, '0').localeCompare(b.padStart(5, '0'))
}
