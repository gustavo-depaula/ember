import { describe, expect, it } from 'vitest'

import { phrasing } from '../phrasing'
import type { Schedule } from '../schedule'

const pt = phrasing('pt-BR')
const en = phrasing('en-US')
const week = (...days: number[]): Schedule => ({ type: 'days-of-week', days })

describe('phrasing the days', () => {
  it.each([
    [week(1, 3, 5), 'às segundas, quartas e sextas', 'on Mondays, Wednesdays and Fridays'],
    [week(5), 'às sextas', 'on Fridays'],
    [week(1, 2, 3, 4, 5, 6), 'de segunda a sábado', 'Monday to Saturday'],
    [week(6, 0), 'aos fins de semana', 'on weekends'],
    [week(0, 1, 2, 3, 4, 5, 6), 'todos os dias', 'every day'],
    [week(5, 6, 0), 'de sexta a domingo', 'Friday to Sunday'],
    [week(3, 5, 6), 'às quartas, sextas e aos sábados', 'on Wednesdays, Fridays and Saturdays'],
    [week(1, 6, 0), 'às segundas, aos sábados e domingos', 'on Mondays, Saturdays and Sundays'],
  ])('%j', (schedule, inPt, inEn) => {
    expect(pt.days(schedule)).toBe(inPt)
    expect(en.days(schedule)).toBe(inEn)
  })

  it('names the weeks of a monthly weekday with the weekday’s gender', () => {
    expect(pt.days({ type: 'nth-weekday', n: [1], day: 6 })).toBe('no primeiro sábado do mês')
    expect(pt.days({ type: 'nth-weekday', n: [3, 1], day: 5 })).toBe(
      'na primeira e na terceira sexta-feira do mês',
    )
    expect(en.days({ type: 'nth-weekday', n: [1, 3], day: 6 })).toBe(
      'on the first and third Saturdays of the month',
    )
    expect(pt.days({ type: 'nth-weekday', n: [-1], day: 0 })).toBe('no último domingo do mês')
  })
})

describe('phrasing the times', () => {
  it('reads noon, one o’clock and minutes the way people say them', () => {
    expect(pt.times(['06:00', '12:00', '18:00'])).toBe('às 6h, ao meio-dia e às 18h')
    expect(pt.times(['01:00'])).toBe('à 1h')
    expect(pt.times(['06:30'])).toBe('às 6h30')
    expect(en.times(['06:30', '12:00', '15:00'])).toBe('at 6:30 am, at noon and at 3 pm')
  })
})
