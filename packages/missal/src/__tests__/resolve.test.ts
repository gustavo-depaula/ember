import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { celebrationsOn, resolveOfDay } from '../calendar/resolve'
import type { MissalCalendar } from '../types'
import upstream from './upstream-calendar.json'

const calendar: MissalCalendar = JSON.parse(
  readFileSync(new URL('../../../../content/missal/calendar.json', import.meta.url), 'utf8'),
)
const golden = upstream as unknown as Record<string, { saints: string[] }>

const on = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}
const ids = (iso: string, regions?: string[]) =>
  resolveOfDay(on(iso), calendar, { regions }).celebrations.map((c) => c.id)

// Slips in upstream's saints switch, which repeats every date in three season
// blocks: a saint filed under a neighbouring date in one block…
const upstreamWrongDate: Record<string, string[]> = {
  '02-18': ['sanctorale.02-21'],
  '05-04': ['sanctorale.05-02'],
  '05-11': ['sanctorale.05-12', 'sanctorale.05-12.pancras'],
}
// …and one left out of the Easter block.
const upstreamOmits = new Set(['sanctorale.05-10'])

describe('sanctoral cycle against the upstream calendar', () => {
  it('keeps the saints upstream lists for the General Calendar, 2020-2040', () => {
    const days = Object.entries(golden)
    expect(days.length).toBeGreaterThan(7600)
    const wrong: string[] = []
    for (const [iso, { saints }] of days) {
      const all = celebrationsOn(on(iso), calendar)
      const temporal = all.find((c) => c.kind === 'tempore')
      const mine = all.filter((c) => c.kind === 'sanctoral')
      const monthDay = iso.slice(5)
      const theirs = saints.filter(
        (id) =>
          // Upstream shows Opus Dei's propers to everyone and lists a vigil as
          // a saint of its own; three of its links point at nothing.
          !id.startsWith('?') &&
          !id.endsWith('.vigil') &&
          !id.includes('opus-dei') &&
          !upstreamWrongDate[monthDay]?.includes(id),
      )
      for (const c of mine) {
        // On the greater days upstream skips the saints altogether.
        const listed = (temporal?.precedence ?? 13) > 6 && !upstreamOmits.has(c.id)
        if (listed && !c.transferred && !theirs.includes(c.id)) wrong.push(`${iso} extra ${c.id}`)
      }
      for (const id of theirs) {
        // Upstream never moves an impeded solemnity; the new calendar does.
        const solemnity = (calendar.formularies[id]?.precedence ?? 13) <= 4
        if (!solemnity && !mine.some((c) => c.id === id)) wrong.push(`${iso} missing ${id}`)
      }
    }
    expect(wrong).toEqual([])
  })
})

describe('precedence', () => {
  it('moves the Annunciation out of Holy Week to the Monday after the Easter octave', () => {
    expect(ids('2024-03-25')).toEqual(['tempore.holy-week.monday'])
    expect(ids('2024-04-08')).toEqual(['sanctorale.03-25'])
  })

  it('anticipates St Joseph to the Saturday before Palm Sunday when 19 March is in Holy Week', () => {
    expect(ids('2035-03-19')).toEqual(['tempore.holy-week.monday'])
    expect(ids('2035-03-17')).toEqual(['sanctorale.03-19'])
  })

  it('moves the Immaculate Conception off a Sunday of Advent', () => {
    expect(ids('2024-12-08')).toEqual(['tempore.advent.week-2.sunday'])
    expect(ids('2024-12-09')).toEqual(['sanctorale.12-08'])
  })

  it('lets a solemnity replace a Sunday of Ordinary Time', () => {
    expect(ids('2026-11-01')).toEqual(['sanctorale.11-01'])
    expect(ids('2025-11-02')).toEqual(['sanctorale.11-02'])
  })

  it('gives a feast of the Lord precedence over a Sunday of Ordinary Time, but not a saint', () => {
    expect(ids('2026-08-06')[0]).toBe('sanctorale.08-06')
    expect(ids('2028-08-06')).toEqual(['sanctorale.08-06'])
    // St Lawrence, a feast, on a Sunday in 2025.
    expect(ids('2025-08-10')).toEqual(['tempore.ordinary-time.week-19.sunday'])
  })

  it('offers nothing but the day on Ash Wednesday and in the Triduum', () => {
    expect(ids('2026-02-18')).toEqual(['tempore.lent.ash-wednesday'])
    expect(ids('2026-04-03')).toEqual(['tempore.holy-week.good-friday'])
  })

  it('reduces a memorial to a commemoration on a weekday of Lent', () => {
    const day = resolveOfDay(on('2026-03-07'), calendar)
    expect(day.celebrations[0].id).toBe('tempore.lent.week-2.saturday')
    expect(day.celebrations[1]).toMatchObject({ id: 'sanctorale.03-07', commemoration: true })
  })

  it('makes an obligatory memorial the Mass of the day', () => {
    expect(ids('2026-01-28')).toEqual(['sanctorale.01-28'])
  })

  it('offers optional memorials and the weekday as free choices', () => {
    expect(ids('2026-01-20')).toEqual([
      'sanctorale.01-20',
      'sanctorale.01-20.sebastian',
      'tempore.ordinary-time.week-2.tuesday',
    ])
  })

  it('keeps Mary, Mother of the Church on the Monday after Pentecost', () => {
    expect(ids('2026-05-25')).toEqual(['sanctorale.mary-mother-of-the-church'])
  })

  it('gives St Stephen his day in the Christmas octave, which has no Mass of its own', () => {
    const day = resolveOfDay(on('2026-12-26'), calendar)
    expect(day.celebrations.map((c) => c.id)).toEqual(['sanctorale.12-26'])
    expect(day.temporal.masses).toEqual([])
  })

  it('offers all four Masses of Christmas', () => {
    const day = resolveOfDay(on('2026-12-25'), calendar)
    expect(day.celebrations[0].masses.map((m) => m.key)).toEqual(['day', 'vigil', 'night', 'dawn'])
  })
})

describe('regions', () => {
  it('keeps Our Lady of Aparecida as a solemnity in Brazil only', () => {
    expect(ids('2026-10-12', ['brazil'])).toEqual(['sanctorale.10-12.brazil'])
    expect(ids('2026-10-12')).toEqual(['tempore.ordinary-time.week-28.monday'])
  })

  it('moves Epiphany and the Ascension to Sunday in Brazil, and keeps Corpus Christi on Thursday', () => {
    expect(ids('2026-01-04', ['brazil'])).toEqual(['tempore.christmas.epiphany'])
    expect(ids('2026-01-06')).toEqual(['tempore.christmas.epiphany'])
    expect(ids('2026-05-17', ['brazil'])).toEqual(['tempore.easter.ascension'])
    expect(ids('2026-05-14')).toEqual(['tempore.easter.ascension'])
    expect(ids('2026-06-04', ['brazil'])).toEqual(['tempore.solemnity.corpus-christi'])
  })

  it('celebrates the Baptism of the Lord on Monday when Epiphany is the Sunday of 7 or 8 January', () => {
    // 2024: Epiphany on Sunday 7 January where it is moved.
    expect(ids('2024-01-08', ['brazil'])).toEqual(['tempore.christmas.baptism-of-the-lord'])
    expect(ids('2024-01-09', ['brazil'])).toEqual(['tempore.ordinary-time.week-1.tuesday'])
  })
})
