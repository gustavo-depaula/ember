import type { Service } from '@ember/api'
import { describe, expect, it } from 'vitest'
import { weekLine } from './summary'

const mass = (byDay: string, startTime: string, kind: Service['kind'] = 'mass') =>
  ({ id: `${byDay}${startTime}`, kind, rrule: `FREQ=WEEKLY;BYDAY=${byDay}`, startTime }) as Service

describe('weekLine', () => {
  it('leads with Sunday and runs the weekdays that share their times together', () => {
    const services = [
      mass('MO,TU,WE,TH,FR', '18:30'),
      mass('SA', '17:00'),
      mass('SU', '07:00'),
      mass('SU', '09:00'),
      mass('SU', '19:00'),
      mass('SA', '09:00', 'confession'),
    ]
    expect(weekLine(services, 'mass', 'pt-BR')).toBe('dom 7h, 9h e 19h · seg a sex 18h30 · sáb 17h')
    expect(weekLine(services, 'mass', 'en-US')).toBe(
      'Sun 7:00, 9:00, and 19:00 · Mon–Fri 18:30 · Sat 17:00',
    )
    expect(weekLine(services, 'confession', 'pt-BR')).toBe('sáb 9h')
  })

  it('names two days apart and keeps days with other times on their own', () => {
    const services = [mass('TU,WE', '07:00'), mass('FR', '07:00'), mass('FR', '19:00')]
    expect(weekLine(services, 'mass', 'pt-BR')).toBe('ter, qua 7h · sex 7h e 19h')
  })

  it('is empty for a church without that service', () => {
    expect(weekLine([mass('SU', '08:00')], 'confession', 'pt-BR')).toBe('')
  })
})
