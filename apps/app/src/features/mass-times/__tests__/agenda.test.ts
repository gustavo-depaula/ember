import type { Service } from '@ember/api'
import { describe, expect, it } from 'vitest'
import type { NearbyChurch } from '@/lib/mass-times'
import { agenda, bucketOf, catchStatus, dayOffset, visitDay, whenChoices } from '../agenda'

function church(id: string, services: Partial<Service>[], distanceKm?: number): NearbyChurch {
  return {
    id,
    name: id,
    timezone: 'UTC',
    distanceKm,
    services: services.map((s) => ({
      kind: 'mass',
      rrule: 'FREQ=DAILY',
      startTime: '20:00',
      exdate: null,
      rdate: null,
      ...s,
    })),
  } as NearbyChurch
}

// Tuesday 2026-06-23, 19:10
const tuesdayEvening = new Date(Date.UTC(2026, 5, 23, 19, 10))
const times = (rows: ReturnType<typeof agenda>) =>
  rows.map((r) => `${r.church.id} ${r.upcoming.occurrence.startTime}`)

describe('agenda', () => {
  const near = church('near', [
    { startTime: '07:00' },
    { startTime: '19:00' },
    { startTime: '20:00' },
    { startTime: '23:00' },
  ])

  it('now: a Mass begun up to 15 minutes ago, through three hours ahead', () => {
    expect(times(agenda([near], 'mass', 'now', tuesdayEvening))).toEqual([
      'near 19:00',
      'near 20:00',
    ])
  })

  it('now: confession under way stays listed until it ends', () => {
    const c = church('c', [{ kind: 'confession', startTime: '18:00', endTime: '19:30' }])
    expect(times(agenda([c], 'confession', 'now', tuesdayEvening))).toEqual(['c 18:00'])
    expect(agenda([c], 'confession', 'now', new Date(Date.UTC(2026, 5, 23, 19, 31)))).toEqual([])
  })

  it('today keeps the rest of the evening; tomorrow the whole day', () => {
    expect(times(agenda([near], 'mass', 'today', tuesdayEvening))).toEqual([
      'near 19:00',
      'near 20:00',
      'near 23:00',
    ])
    expect(times(agenda([near], 'mass', 'tomorrow', tuesdayEvening))).toEqual([
      'near 07:00',
      'near 19:00',
      'near 20:00',
      'near 23:00',
    ])
  })

  it('sunday reaches the coming Sunday', () => {
    const sundays = church('s', [{ rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00' }])
    const rows = agenda([sundays], 'mass', 'sunday', tuesdayEvening)
    expect(rows.map((r) => r.upcoming.instant.toISOString())).toEqual(['2026-06-28T10:00:00.000Z'])
  })
})

describe('dayOffset and whenChoices', () => {
  it('drops "on Sunday" on Saturday and Sunday', () => {
    const saturday = new Date(Date.UTC(2026, 5, 27, 9))
    const sunday = new Date(Date.UTC(2026, 5, 28, 9))
    expect(dayOffset('sunday', tuesdayEvening)).toBe(5)
    expect(whenChoices(tuesdayEvening)).toContain('sunday')
    expect(whenChoices(saturday)).not.toContain('sunday')
    expect(whenChoices(sunday)).not.toContain('sunday')
  })
})

describe('bucketOf', () => {
  it('groups "now" by minutes to start', () => {
    const rows = agenda(
      [church('b', [{ startTime: '19:30' }, { startTime: '20:30' }, { startTime: '21:30' }])],
      'mass',
      'now',
      tuesdayEvening,
    )
    expect(rows.map((r) => bucketOf(r, 'now'))).toEqual(['startingNow', 'nextHour', 'later'])
  })
})

describe('catchStatus', () => {
  const rowAt = (km: number, startTime: string) =>
    agenda([church('x', [{ startTime }], km)], 'mass', 'now', tuesdayEvening)[0]

  it('tells when to leave, to leave now, or that it is too late', () => {
    // 20:00 is 50 minutes off; 1 km on foot is 13 minutes.
    expect(catchStatus(rowAt(1, '20:00'), 'foot')).toEqual({
      status: 'leaveIn',
      minutes: 37,
      by: '19:47',
      travel: 13,
    })
    expect(catchStatus(rowAt(3.2, '20:00'), 'foot')).toEqual({ status: 'leaveNow', travel: 42 })
    expect(catchStatus(rowAt(5, '20:00'), 'foot')).toEqual({ status: 'tooLate' })
    expect(catchStatus(rowAt(5, '20:00'), 'car')).toEqual({
      status: 'leaveIn',
      minutes: 31,
      by: '19:41',
      travel: 19,
    })
  })

  it('says a Mass has started rather than timing the trip', () => {
    expect(catchStatus(rowAt(1, '19:00'), 'foot')).toEqual({ status: 'started' })
  })
})

describe('visitDay', () => {
  it("lists the day's services of every kind and what is on now", () => {
    const c = church('v', [
      { startTime: '07:00' },
      { kind: 'adoration', startTime: '08:00', endTime: '18:00' },
      { kind: 'confession', startTime: '19:00', endTime: '20:00' },
    ])
    const { services, underway } = visitDay(c, 'now', tuesdayEvening)
    expect(services.map((s) => s.service.kind)).toEqual(['mass', 'adoration', 'confession'])
    expect(underway?.service.kind).toBe('confession')
    expect(visitDay(c, 'tomorrow', tuesdayEvening).underway).toBeUndefined()
  })
})

describe('catchStatus for a span under way', () => {
  // Confession 18:00–19:30; it is 19:10, so 20 minutes are left.
  const rowAt = (km: number) =>
    agenda(
      [church('c', [{ kind: 'confession', startTime: '18:00', endTime: '19:30' }], km)],
      'confession',
      'now',
      tuesdayEvening,
    )[0]

  it('is reachable while you would arrive with time to spare', () => {
    expect(catchStatus(rowAt(0.5), 'foot')).toEqual({ status: 'underway', travel: 7 })
  })

  it('is too late when you would arrive near its end', () => {
    expect(catchStatus(rowAt(1), 'foot')).toEqual({ status: 'tooLate' })
  })
})
