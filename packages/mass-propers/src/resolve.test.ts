import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildYearCalendar,
  type DayCalendar,
  getCelebrationsForDate,
  type LiturgicalEntry,
} from '@ember/liturgical'
import { describe, expect, it } from 'vitest'

import { chooseProperSource } from './resolve'

const entries: LiturgicalEntry[] = JSON.parse(
  readFileSync(resolve(__dirname, '../../../content/liturgical/entries.json'), 'utf8'),
)

const calendar2026 = buildYearCalendar({ year: 2026, form: 'ef', entries })
const calendar2025 = buildYearCalendar({ year: 2025, form: 'ef', entries })

function day(
  year: number,
  month: number,
  date: number,
): { date: Date; cal: DayCalendar | undefined } {
  const d = new Date(year, month, date)
  const cal = year === 2025 ? calendar2025 : calendar2026
  return { date: d, cal: getCelebrationsForDate(cal, d) }
}

describe('chooseProperSource', () => {
  it('Holy Thursday uses Tempora over St. Francis of Paola', () => {
    const { date, cal } = day(2026, 3, 2)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('Easter Sunday uses Tempora', () => {
    const { date, cal } = day(2026, 3, 5)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('Palm Sunday uses Tempora', () => {
    const { date, cal } = day(2026, 2, 29)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('Ash Wednesday uses Tempora', () => {
    const { date, cal } = day(2026, 1, 18)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('Christmas Day is classified as Tempora (solemnity_temporal)', () => {
    // Christmas is a temporal feast in the calendar, but DO stores it in Sancti (12-25).
    // The loader handles this fallback — chooseProperSource just reports the calendar's view.
    const { date, cal } = day(2025, 11, 25)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('regular Lenten feria uses Tempora', () => {
    const { date, cal } = day(2026, 2, 5)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('Trinity Sunday uses Tempora', () => {
    const { date, cal } = day(2026, 5, 7)
    expect(chooseProperSource(date, cal)).toBe('tempora')
  })

  it('defaults to Tempora when no calendar is provided', () => {
    expect(chooseProperSource(new Date(2026, 3, 2), undefined)).toBe('tempora')
  })
})
