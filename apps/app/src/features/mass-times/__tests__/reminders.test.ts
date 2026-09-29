import type { Service } from '@ember/api'
import { describe, expect, it } from 'vitest'
import { massReminderSlots } from '../reminders'

function mass(rrule: string, startTime: string): Service {
  return { id: `${rrule}-${startTime}`, kind: 'mass', rrule, startTime } as Service
}

describe('massReminderSlots', () => {
  it('turns each weekday of a weekly rule into a slot, lead minutes before', () => {
    const slots = massReminderSlots([mass('FREQ=WEEKLY;BYDAY=SU,WE', '10:00')], 30)
    // expo weekday: 1 = Sunday
    expect(slots).toEqual([
      { weekday: 1, hour: 9, minute: 30 },
      { weekday: 4, hour: 9, minute: 30 },
    ])
  })

  it('rolls a lead that crosses midnight back to the previous day', () => {
    const slots = massReminderSlots([mass('FREQ=WEEKLY;BYDAY=SU', '00:15')], 30)
    expect(slots).toEqual([{ weekday: 7, hour: 23, minute: 45 }])
  })

  it('skips rules a weekly notification cannot express', () => {
    const slots = massReminderSlots(
      [
        mass('FREQ=MONTHLY;BYDAY=1FR', '19:00'),
        mass('FREQ=WEEKLY;BYDAY=SU;BYMONTH=2,3,4', '08:00'),
        mass('FREQ=WEEKLY;INTERVAL=2;BYDAY=SA', '18:00'),
      ],
      30,
    )
    expect(slots).toEqual([])
  })

  it('ignores confession and adoration, and dedupes identical slots', () => {
    const slots = massReminderSlots(
      [
        mass('FREQ=WEEKLY;BYDAY=SU', '10:00'),
        mass('FREQ=WEEKLY;BYDAY=SU', '10:00'),
        { ...mass('FREQ=WEEKLY;BYDAY=SA', '16:00'), kind: 'confession' },
      ],
      30,
    )
    expect(slots).toEqual([{ weekday: 1, hour: 9, minute: 30 }])
  })
})
