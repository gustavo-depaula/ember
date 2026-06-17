// On-device schedule expansion. The backend stores recurrence rules, never materialized
// occurrences; the client expands `service.rrule` + `startTime` into upcoming times with
// `@ember/api`'s zoneless `expandService`. Occurrence days land at UTC midnight and `startTime` is
// wall-clock — so to ask "what's next" we evaluate everything in the church's OWN wall clock
// (`wallClockNow`), keeping the comparison in one frame and letting each church's timezone resolve
// correctly even when the device is elsewhere.

import { expandService, type Occurrence, type Service, type ServiceKind } from '@ember/api'

export type UpcomingService = {
  service: Service
  occurrence: Occurrence
  instant: Date // wall-clock instant in the UTC frame; compare only against `wallClockNow`
}

const timePattern = /^(\d{1,2}):(\d{2})$/

// Occurrence day (UTC midnight) + 'HH:MM' → a single comparable instant in the UTC frame.
export function occurrenceInstant({ date, startTime }: Occurrence): Date {
  const match = timePattern.exec(startTime)
  const hours = match ? Number(match[1]) : 0
  const minutes = match ? Number(match[2]) : 0
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes),
  )
}

// "Now" as the church sees it, in the same zoneless UTC frame as the occurrences. Falls back to the
// raw instant if the runtime lacks timezone data for the given zone.
export function wallClockNow(timezone: string, now = new Date()): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now)
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
    const hour = get('hour') % 24 // some engines render midnight as 24
    return new Date(Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute')))
  } catch {
    return now
  }
}

// All upcoming services from `from`, flattened across rules and sorted by instant. `from` is the
// day-granular lower bound — pass `wallClockNow(church.timezone)` so today's not-yet-past times
// stay included and tomorrow's sort after them.
export function expandUpcoming(
  services: Service[],
  {
    from = new Date(),
    kinds,
    perService = 4,
  }: { from?: Date; kinds?: ServiceKind[]; perService?: number } = {},
): UpcomingService[] {
  const out: UpcomingService[] = []
  for (const service of services) {
    if (kinds && !kinds.includes(service.kind as ServiceKind)) continue
    for (const occurrence of expandService(service, { from, count: perService })) {
      out.push({ service, occurrence, instant: occurrenceInstant(occurrence) })
    }
  }
  return out.sort((a, b) => a.instant.getTime() - b.instant.getTime())
}

// Whether the church offers a service (optionally of one kind) at any point *today* in its own wall
// clock — including times earlier today that have already passed. Expanding from today's midnight (not
// `now`) is what makes "has Mass today" true all day, not just before the last Mass.
export function hasServiceToday(
  services: Service[],
  { timezone, kind }: { timezone: string; kind?: ServiceKind },
): boolean {
  const now = wallClockNow(timezone)
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const kinds = kind ? [kind] : undefined
  return expandUpcoming(services, { from: midnight, kinds, perService: 2 }).some(
    (u) =>
      u.occurrence.date.getUTCFullYear() === now.getUTCFullYear() &&
      u.occurrence.date.getUTCMonth() === now.getUTCMonth() &&
      u.occurrence.date.getUTCDate() === now.getUTCDate(),
  )
}

// The single next service at/after `now` (default: the church's own wall clock), optionally for one
// kind. Expanding from `now` then filtering on the instant drops times already past earlier today.
export function nextService(
  services: Service[],
  { timezone, kind, now }: { timezone: string; kind?: ServiceKind; now?: Date },
): UpcomingService | undefined {
  const from = now ?? wallClockNow(timezone)
  const kinds = kind ? [kind] : undefined
  return expandUpcoming(services, { from, kinds }).find((u) => u.instant >= from)
}
