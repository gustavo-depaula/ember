import type { Service } from '@ember/api'
import { describe, expect, it } from 'vitest'
import {
  expandUpcoming,
  nextService,
  occurrenceInstant,
  serviceUnderway,
  wallClockNow,
} from '../schedule'

// Minimal service factory — expansion only reads rrule/startTime/exdate/rdate/kind.
function svc(partial: Partial<Service>): Service {
  return {
    kind: 'mass',
    rrule: 'FREQ=WEEKLY;BYDAY=SU',
    startTime: '10:00',
    exdate: null,
    rdate: null,
    ...partial,
  } as Service
}

describe('occurrenceInstant', () => {
  it('combines the occurrence day with HH:MM in the UTC frame', () => {
    const date = new Date(Date.UTC(2026, 5, 21)) // Sun 2026-06-21
    expect(occurrenceInstant({ date, startTime: '18:30' }).toISOString()).toBe(
      '2026-06-21T18:30:00.000Z',
    )
  })
})

describe('expandUpcoming', () => {
  it('merges multiple rules and sorts by instant', () => {
    const from = new Date(Date.UTC(2026, 5, 15)) // Mon
    const services = [
      svc({ rrule: 'FREQ=WEEKLY;BYDAY=SU', startTime: '10:00' }),
      svc({ rrule: 'FREQ=WEEKLY;BYDAY=SA', startTime: '19:00', kind: 'mass' }),
    ]
    const out = expandUpcoming(services, { from, perService: 1 })
    expect(out).toHaveLength(2)
    // Saturday (20th) sorts before Sunday (21st)
    expect(out[0].instant.getTime()).toBeLessThan(out[1].instant.getTime())
    expect(out[0].occurrence.startTime).toBe('19:00')
  })

  it('filters by kind', () => {
    const from = new Date(Date.UTC(2026, 5, 15))
    const services = [
      svc({ kind: 'mass', startTime: '10:00' }),
      svc({ kind: 'confession', rrule: 'FREQ=WEEKLY;BYDAY=SA', startTime: '16:00' }),
    ]
    const out = expandUpcoming(services, { from, kinds: ['confession'], perService: 2 })
    expect(out.every((u) => u.service.kind === 'confession')).toBe(true)
  })
})

describe('nextService', () => {
  it('skips a time already past earlier today and returns the next', () => {
    // Sunday 14:00 UTC — the 10:00 Sunday Mass is past, next is the following Sunday
    const now = new Date(Date.UTC(2026, 5, 21, 14, 0))
    const next = nextService([svc({ startTime: '10:00' })], { timezone: 'UTC', kind: 'mass', now })
    expect(next?.occurrence.date.getUTCDate()).toBe(28) // next Sunday
  })

  it('returns a later-today time that has not passed', () => {
    const now = new Date(Date.UTC(2026, 5, 21, 8, 0)) // Sunday 08:00, before 10:00 Mass
    const next = nextService([svc({ startTime: '10:00' })], { timezone: 'UTC', kind: 'mass', now })
    expect(next?.occurrence.date.getUTCDate()).toBe(21) // same Sunday
  })
})

describe('wallClockNow', () => {
  it('shifts a real instant into the zone wall clock', () => {
    // 2026-06-21T12:00Z is 09:00 in São Paulo (UTC-3)
    const wall = wallClockNow('America/Sao_Paulo', new Date(Date.UTC(2026, 5, 21, 12, 0)))
    expect(wall.getUTCHours()).toBe(9)
    expect(wall.getUTCDate()).toBe(21)
  })
})

describe('serviceUnderway', () => {
  // Tuesday 2026-06-23
  const at = (h: number, m = 0) => new Date(Date.UTC(2026, 5, 23, h, m))
  const tuesdayMass = svc({ rrule: 'FREQ=WEEKLY;BYDAY=TU', startTime: '20:00' })

  it('holds a Mass from half an hour before until an hour in', () => {
    const on = (now: Date) => serviceUnderway([tuesdayMass], { timezone: 'UTC', now })
    expect(on(at(19, 29))).toBeUndefined()
    expect(on(at(19, 30))?.occurrence.startTime).toBe('20:00')
    expect(on(at(21, 0))?.occurrence.startTime).toBe('20:00')
    expect(on(at(21, 1))).toBeUndefined()
  })

  it('runs to a listed end time', () => {
    const adoration = svc({
      kind: 'adoration',
      rrule: 'FREQ=WEEKLY;BYDAY=TU',
      startTime: '14:00',
      endTime: '18:00',
    })
    expect(serviceUnderway([adoration], { timezone: 'UTC', now: at(17, 30) })?.service.kind).toBe(
      'adoration',
    )
    expect(serviceUnderway([adoration], { timezone: 'UTC', now: at(18, 1) })).toBeUndefined()
  })

  it('picks the service starting nearest now when windows overlap', () => {
    const confession = svc({
      kind: 'confession',
      rrule: 'FREQ=WEEKLY;BYDAY=TU',
      startTime: '19:00',
    })
    // 19:50: confession began 50 minutes ago, Mass starts in 10.
    expect(
      serviceUnderway([confession, tuesdayMass], { timezone: 'UTC', now: at(19, 50) })?.service
        .kind,
    ).toBe('mass')
  })

  it('ignores another day', () => {
    const sunday = svc({ startTime: '20:00' })
    expect(serviceUnderway([sunday], { timezone: 'UTC', now: at(20, 0) })).toBeUndefined()
  })
})
