import type { ServiceKind } from '@ember/api'
import type { NearbyChurch, UpcomingService } from '@/lib/mass-times'
import { expandUpcoming, serviceEnd, wallClockNow } from '@/lib/mass-times'

// The nearby list as an answer to "I want to … <when>": for a service, a timetable of its
// occurrences across the nearest churches, grouped by when; for a visit, the churches themselves
// with what is scheduled there that day. Every instant is in its church's wall-clock frame
// (see lib/mass-times/schedule.ts) and is compared only against that church's own `now`.

export type Intent = ServiceKind | 'visit'
export type When = 'now' | 'today' | 'tomorrow' | 'sunday'
export type TravelMode = 'foot' | 'car'

export type AgendaRow = {
  church: NearbyChurch
  upcoming: UpcomingService
  end: Date
  now: Date // the church's wall clock
}

export type Bucket = 'startingNow' | 'nextHour' | 'later' | 'morning' | 'afternoon' | 'evening'

const minuteMs = 60_000
const dayMs = 86_400_000
// "Now" reaches three hours ahead: far enough to plan the evening, near enough to stay "now".
const nowHorizonMs = 3 * 60 * minuteMs
// A Mass that began a few minutes ago can still be joined; one well under way can't.
const lateJoinMs = 15 * minuteMs
// Only the nearest churches compete: a timetable of every church in a wide map view would bury the
// ones you can reach.
const candidateChurches = 20

// A wall-clock instant as the bulletin's 24-hour "HH:MM".
export function clockOf(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())

// Days from `now` to the day `when` names; Sunday counts today when today is Sunday.
export function dayOffset(when: When, now: Date): number {
  if (when === 'tomorrow') return 1
  if (when === 'sunday') return (7 - now.getUTCDay()) % 7
  return 0
}

// "On Sunday" says nothing new on a Saturday or a Sunday, when it is tomorrow or today.
export function whenChoices(now: Date): When[] {
  return dayOffset('sunday', now) > 1
    ? ['now', 'today', 'tomorrow', 'sunday']
    : ['now', 'today', 'tomorrow']
}

function inWindow(row: AgendaRow, kind: ServiceKind, when: When): boolean {
  const start = row.upcoming.instant.getTime()
  const now = row.now.getTime()
  // A Mass is caught at its start; confession and adoration run for a span, so any time before the
  // end will do.
  const notMissed = kind === 'mass' ? start >= now - lateJoinMs : row.end.getTime() > now
  if (when === 'now') return notMissed && start <= now + nowHorizonMs
  const day = startOfDay(row.now) + dayOffset(when, row.now) * dayMs
  return startOfDay(row.upcoming.instant) === day && (day > startOfDay(row.now) || notMissed)
}

export function agenda(
  churches: NearbyChurch[],
  kind: ServiceKind,
  when: When,
  at = new Date(),
): AgendaRow[] {
  return (
    churches
      .slice(0, candidateChurches)
      .flatMap((church) => {
        const now = wallClockNow(church.timezone, at)
        return expandUpcoming(church.services, { from: now, kinds: [kind], perService: 8 }).map(
          (upcoming) => ({ church, upcoming, end: serviceEnd(upcoming), now }),
        )
      })
      .filter((row) => inWindow(row, kind, when))
      // Same time, nearer church first.
      .sort(
        (a, b) =>
          a.upcoming.instant.getTime() - b.upcoming.instant.getTime() ||
          (a.church.distanceKm ?? 0) - (b.church.distanceKm ?? 0),
      )
  )
}

export function bucketOf(row: AgendaRow, when: When): Bucket {
  if (when === 'now') {
    const toStart = row.upcoming.instant.getTime() - row.now.getTime()
    if (toStart < 30 * minuteMs) return 'startingNow'
    return toStart < 90 * minuteMs ? 'nextHour' : 'later'
  }
  const hour = row.upcoming.instant.getUTCHours()
  if (hour < 12) return 'morning'
  return hour < 18 ? 'afternoon' : 'evening'
}

// Travel time from straight-line distance: on foot about 13 min/km (5 km/h with the detours of a
// street grid), by car 4 minutes to get going plus 3 min/km of city traffic. An estimate, shown as
// one; it is wrong where a river or a highway stands between you and the church.
export function travelMinutes(km: number, mode: TravelMode): number {
  return Math.max(1, Math.round(mode === 'foot' ? km * 13 : 4 + km * 3))
}

export type Catch =
  | { status: 'leaveIn'; minutes: number; by: string; travel: number }
  | { status: 'leaveNow'; travel: number }
  | { status: 'tooLate' }
  | { status: 'started' }
  | { status: 'underway'; travel?: number }

// Arriving at confession or adoration with less than this left of it is arriving too late.
const spanMinimumMinutes = 10

// Whether you can still make it, from now, the start and the travel time. A Mass under way has
// started; confession and adoration under way can be reached as long as you'd arrive before the end.
export function catchStatus(row: AgendaRow, mode: TravelMode): Catch | undefined {
  const { church, upcoming, end, now } = row
  const toStart = (upcoming.instant.getTime() - now.getTime()) / minuteMs
  const travel =
    church.distanceKm === undefined ? undefined : travelMinutes(church.distanceKm, mode)
  if (toStart <= 0) {
    if (upcoming.service.kind === 'mass') return { status: 'started' }
    if (travel === undefined) return { status: 'underway' }
    const toEnd = (end.getTime() - now.getTime()) / minuteMs
    return toEnd - travel < spanMinimumMinutes
      ? { status: 'tooLate' }
      : { status: 'underway', travel }
  }
  if (travel === undefined) return undefined
  const slack = Math.floor(toStart - travel)
  if (slack < 0) return { status: 'tooLate' }
  if (slack < 10) return { status: 'leaveNow', travel }
  return {
    status: 'leaveIn',
    minutes: slack,
    by: clockOf(new Date(now.getTime() + slack * minuteMs)),
    travel,
  }
}

// A visit: what is scheduled at the church on the day `when` names, every kind, in time order, and
// what is on right now. It claims nothing about the doors — many churches are open between services.
export function visitDay(
  church: NearbyChurch,
  when: When,
  at = new Date(),
): { services: UpcomingService[]; underway?: UpcomingService } {
  const now = wallClockNow(church.timezone, at)
  const day = startOfDay(now) + dayOffset(when, now) * dayMs
  const services = expandUpcoming(church.services, { from: new Date(day), perService: 1 }).filter(
    (u) => startOfDay(u.instant) === day,
  )
  const underway =
    when === 'now' || when === 'today'
      ? services.find((u) => u.instant <= now && now < serviceEnd(u))
      : undefined
  return { services, underway }
}
