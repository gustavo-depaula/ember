import { describe, expect, it } from 'vitest'
import { minutesText, practiceMinutes } from '../duration'

const sunday = new Date(2026, 9, 11)
const monday = new Date(2026, 9, 12)

describe('practiceMinutes', () => {
  const breviary = {
    estimatedMinutes: 15,
    hourMinutes: { Matutinum: 27, Laudes: 13, Tertia: 7 },
  }

  it('times an office by the hour prayed', () => {
    expect(minutesText(practiceMinutes(breviary, { hour: 'Matutinum' }))).toBe('27 min')
  })

  it('gives the span of its hours when none is chosen, or one it does not time', () => {
    expect(minutesText(practiceMinutes(breviary))).toBe('7–27 min')
    expect(minutesText(practiceMinutes(breviary, { hour: 'Nona' }))).toBe('7–27 min')
    expect(minutesText(practiceMinutes({ estimatedMinutes: 15, minutesRange: [7, 27] }))).toBe(
      '7–27 min',
    )
  })

  const mass = {
    estimatedMinutes: 60,
    duration: { type: 'by-day' as const, weekday: 30, sunday: 75 },
  }

  it('times Mass by the day: Sundays and holy days of obligation are the long one', () => {
    expect(minutesText(practiceMinutes(mass, { date: monday }))).toBe('30 min')
    expect(minutesText(practiceMinutes(mass, { date: sunday }))).toBe('1h15')
    expect(minutesText(practiceMinutes(mass, { date: monday, holyDay: true }))).toBe('1h15')
    expect(minutesText(practiceMinutes(mass))).toBe('30 min–1h15')
  })

  const mentalPrayer = {
    estimatedMinutes: 15,
    duration: { type: 'chosen' as const, default: 15, choices: [10, 15, 30] },
  }

  it('takes the length its person set over the default', () => {
    expect(minutesText(practiceMinutes(mentalPrayer))).toBe('15 min')
    expect(minutesText(practiceMinutes(mentalPrayer, { chosen: 30 }))).toBe('30 min')
    expect(minutesText(practiceMinutes(mentalPrayer, { chosen: 60 }))).toBe('1h')
  })

  it('has nothing to say of a practice with no minutes', () => {
    expect(practiceMinutes({})).toBeUndefined()
    expect(practiceMinutes(undefined)).toBeUndefined()
  })
})
