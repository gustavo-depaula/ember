import type { Service } from '@ember/api'
import { describe, expect, it } from 'vitest'
import { weeklySchedule } from '../weekly'

function svc(rrule: string, startTime: string, kind = 'mass'): Service {
  return { id: `${kind}-${rrule}-${startTime}`, kind, rrule, startTime } as Service
}

describe('weeklySchedule', () => {
  it('lays weekly rules out Sunday-first with each day’s times in order', () => {
    const { days } = weeklySchedule(
      [
        svc('FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', '12:15'),
        svc('FREQ=WEEKLY;BYDAY=SU', '18:00'),
        svc('FREQ=WEEKLY;BYDAY=SU', '08:30'),
        svc('FREQ=WEEKLY;BYDAY=FR', '07:00'),
      ],
      'mass',
    )
    expect(days).toEqual([
      { dow: 0, times: ['08:30', '18:00'] },
      { dow: 1, times: ['12:15'] },
      { dow: 2, times: ['12:15'] },
      { dow: 3, times: ['12:15'] },
      { dow: 4, times: ['12:15'] },
      { dow: 5, times: ['07:00', '12:15'] },
    ])
  })

  it('keeps other service kinds out', () => {
    const { days } = weeklySchedule(
      [svc('FREQ=WEEKLY;BYDAY=SA', '16:00', 'confession'), svc('FREQ=WEEKLY;BYDAY=SU', '10:00')],
      'mass',
    )
    expect(days).toEqual([{ dow: 0, times: ['10:00'] }])
  })

  it('sets monthly and seasonal rules apart from the weekly grid', () => {
    const { days, other } = weeklySchedule(
      [
        svc('FREQ=MONTHLY;BYDAY=1FR', '19:00'),
        svc('FREQ=MONTHLY;BYDAY=1MO,1FR', '07:00'),
        svc('FREQ=WEEKLY;BYDAY=SU;BYMONTH=2,3,4', '08:00'),
        svc('FREQ=MONTHLY;BYDAY=-1SA', '09:00'),
      ],
      'mass',
    )
    expect(days).toEqual([])
    expect(other).toEqual([
      { kind: 'monthly', weekdays: [{ n: 1, dow: 5 }], startTime: '19:00' },
      {
        kind: 'monthly',
        weekdays: [
          { n: 1, dow: 1 },
          { n: 1, dow: 5 },
        ],
        startTime: '07:00',
      },
      { kind: 'seasonal', dows: [0], months: [2, 3, 4], startTime: '08:00' },
      { kind: 'monthly', weekdays: [{ n: -1, dow: 6 }], startTime: '09:00' },
    ])
  })
})
