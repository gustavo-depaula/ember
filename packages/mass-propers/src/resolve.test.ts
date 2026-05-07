import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  buildYearCalendar,
  type DayCalendar,
  getCelebrationsForDate,
  type LiturgicalEntry,
} from '@ember/liturgical'
import { describe, expect, it } from 'vitest'

import {
  chooseProperSource,
  getRawProperForSlot,
  type PropersDataSource,
  type RawProperFile,
} from './resolve'

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

function makeSource(files: Record<string, RawProperFile>): PropersDataSource {
  return {
    loadTempora: async (id) => files[`tempora/${id}`],
    loadSancti: async (id) => files[`sancti/${id}`],
  }
}

describe('ferial Sunday fallback', () => {
  // 2026-06-08 is Monday after Pent II (Pent02-1) — week 2 Monday post-Trinity.
  const pentFerial = new Date(2026, 5, 8)

  it('Pentecost ferial Monday gap-fills from same week Sunday', async () => {
    const source = makeSource({
      'tempora/Pent02-0': {
        Introitus: { 'en-US': 'Sunday introit', la: 'Introitus Dominicae' },
        Lectio: { 'en-US': 'Sunday epistle', la: 'Lectio Dominicae' },
        Evangelium: { 'en-US': 'Sunday gospel', la: 'Evangelium Dominicae' },
      },
      'tempora/Pent02-1': {
        Prefatio: { la: 'Praefatio communis' },
      },
    })
    const epistle = await getRawProperForSlot(pentFerial, 'epistle', undefined, source)
    expect(epistle?.['en-US']).toBe('Sunday epistle')
    const intr = await getRawProperForSlot(pentFerial, 'introit', undefined, source)
    expect(intr?.['en-US']).toBe('Sunday introit')
  })

  it("ferial's own slot wins over Sunday fallback", async () => {
    const source = makeSource({
      'tempora/Pent02-0': {
        Lectio: { 'en-US': 'Sunday epistle' },
      },
      'tempora/Pent02-1': {
        Lectio: { 'en-US': 'Monday own epistle' },
      },
    })
    const epistle = await getRawProperForSlot(pentFerial, 'epistle', undefined, source)
    expect(epistle?.['en-US']).toBe('Monday own epistle')
  })
})
