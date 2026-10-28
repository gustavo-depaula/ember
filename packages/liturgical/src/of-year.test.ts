import { describe, expect, it } from 'vitest'
import { getLiturgicalDayName } from './dayName'
import { addDays, type Transfers, temporalDay, universalTransfers } from './of-temporal'
import { computeAnchors } from './resolve-date'
import { getLiturgicalSeason } from './season'

// Names a week by its bare number and a named day by its key, so the checks
// read the arithmetic, not the wording.
const t = (key: string, opts?: Record<string, unknown>) =>
  key.startsWith('ordinal') ? key.split('.')[1] : `${key}:${opts?.ordinal ?? ''}`

const sunday: Transfers = { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'sunday' }
const on = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12)

describe('Ordinary Form day names', () => {
  it('number every week as the temporal cycle does, 2025-2030', () => {
    const wrong: string[] = []
    for (let d = on(2025, 1, 1); d < on(2031, 1, 1); d = addDays(d, 1)) {
      const day = temporalDay(d)
      const counted = ['advent', 'lent', 'easter', 'ordinary-time'].includes(day.season)
      if (!counted || day.key || day.week < 1 || (day.season === 'easter' && day.week === 1))
        continue
      const name = getLiturgicalDayName(d, 'of', { t })
      if (!name.endsWith(`:${day.week}`))
        wrong.push(`${d.toDateString()}: ${name} ≠ week ${day.week}`)
    }
    expect(wrong).toEqual([])
  })

  it('name the great days', () => {
    expect(getLiturgicalDayName(on(2026, 12, 25), 'of', { t })).toContain('named.christmas')
    expect(getLiturgicalDayName(on(2026, 2, 18), 'of', { t })).toContain('named.ashWednesday')
    expect(getLiturgicalDayName(on(2026, 4, 3), 'of', { t })).toContain('named.goodFriday')
    expect(getLiturgicalDayName(on(2026, 4, 5), 'of', { t })).toContain('named.easterSunday')
    expect(getLiturgicalDayName(on(2026, 5, 24), 'of', { t })).toContain('named.pentecost')
  })

  it('name Epiphany where it is kept', () => {
    expect(getLiturgicalDayName(on(2026, 1, 6), 'of', { t })).toContain('named.epiphany')
    expect(getLiturgicalDayName(on(2026, 1, 4), 'of', { t }, sunday)).toContain('named.epiphany')
    expect(getLiturgicalDayName(on(2026, 1, 6), 'of', { t }, sunday)).not.toContain(
      'named.epiphany',
    )
  })

  it('count the days of Christmas from Christmas Day', () => {
    expect(getLiturgicalDayName(on(2026, 12, 27), 'of', { t })).toBe(
      'home.liturgicalDay.christmasOrdinal:3',
    )
    expect(getLiturgicalDayName(on(2026, 1, 2), 'of', { t })).toBe(
      'home.liturgicalDay.christmasOrdinal:9',
    )
  })
})

describe('Ordinary Form seasons', () => {
  it('follow the temporal cycle through a year', () => {
    expect(getLiturgicalSeason(on(2026, 1, 11), 'of')).toBe('christmas') // Baptism of the Lord
    expect(getLiturgicalSeason(on(2026, 1, 12), 'of')).toBe('ordinary')
    expect(getLiturgicalSeason(on(2026, 2, 18), 'of')).toBe('lent')
    expect(getLiturgicalSeason(on(2026, 4, 2), 'of')).toBe('lent') // Holy Thursday
    expect(getLiturgicalSeason(on(2026, 5, 24), 'of')).toBe('easter') // Pentecost
    expect(getLiturgicalSeason(on(2026, 5, 25), 'of')).toBe('ordinary')
    expect(getLiturgicalSeason(on(2026, 11, 29), 'of')).toBe('advent')
  })

  it('keep Christmas time a day longer where the Baptism is moved to Monday', () => {
    // 2024: Epiphany on Sunday 7 January where it is moved, the Baptism on Monday 8.
    expect(getLiturgicalSeason(on(2024, 1, 8), 'of', sunday)).toBe('christmas')
    expect(getLiturgicalSeason(on(2024, 1, 8), 'of', universalTransfers)).toBe('ordinary')
  })
})

describe('anchor dates', () => {
  const iso = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

  it('fall where the General Calendar keeps them by default', () => {
    const a = computeAnchors(2024)
    expect([iso(a.epiphany), iso(a.baptism_of_the_lord)]).toEqual(['2024-1-6', '2024-1-7'])
    expect([iso(a.ascension), iso(a.corpus_christi)]).toEqual(['2024-5-9', '2024-5-30'])
  })

  it('follow the region that moves them to a Sunday', () => {
    const a = computeAnchors(2024, sunday)
    // Epiphany on Sunday 7 January, so the Baptism of the Lord on Monday 8.
    expect([iso(a.epiphany), iso(a.baptism_of_the_lord)]).toEqual(['2024-1-7', '2024-1-8'])
    expect([iso(a.ascension), iso(a.corpus_christi)]).toEqual(['2024-5-12', '2024-6-2'])
  })
})
