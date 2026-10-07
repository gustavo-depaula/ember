import { addDays } from '@ember/liturgical'
import { describe, expect, it } from 'vitest'
import { ids, lothDay } from '../day'
import { assembleHour, formsOf, type HourPart, isCommemoration } from '../hour'
import type { Form } from '../index-types'
import { type Hour, hours, officeOf } from '../office'
import { blockText } from '../text'
import { calendar, corpus, on } from './corpus'

// Where the archive the corpus was drawn from goes against the book's own
// rules, the corpus follows the rules, and the reference holds no hash for
// those hours (`scripts/loth/departures.ts`). They are held here instead.
// Numbers are articles of the General Instruction of the Liturgy of the Hours.

const hour = async (iso: string, of: Hour, form?: Form) => {
  const office = officeOf(on(iso), of, calendar)
  const parts = await assembleHour(office, form ?? formsOf(office)[0], corpus)
  return { office, parts, slots: parts.map((part) => part.slot) }
}
const text = (parts: HourPart[], slot: string) =>
  parts
    .filter((part) => part.slot === slot)
    .flatMap((part) => part.blocks.map(blockText))
    .join('\n')
const psalms = (parts: HourPart[]) =>
  parts
    .filter((part) => part.slot.startsWith('psalm-'))
    .flatMap((part) => part.blocks.filter((block) => block.k === 'title').map(blockText))
    .filter((title) => /^(Salmo|Cântico)/.test(title))
    .map((title) => title.split('\n')[0])

describe('Saint Joseph, impeded', () => {
  it('is kept the Monday after a Sunday of Lent, with no first Vespers', async () => {
    expect((await hour('2023-03-18', 'lauds')).office.celebration?.id).not.toBe(ids.joseph)
    const sunday = await hour('2023-03-19', 'vespers')
    expect(sunday.office.firstVespers).toBe(false)
    expect(text(sunday.parts, 'head-hour')).toBe('II Vésperas')
    const lauds = await hour('2023-03-20', 'lauds')
    expect(text(lauds.parts, 'head-title')).toMatch(/^SÃO JOSÉ/)
    expect(psalms(lauds.parts)[0]).toMatch(/^Salmo 62/)
    expect(text((await hour('2023-03-20', 'vespers')).parts, 'head-hour')).toBe('II Vésperas')
    expect(psalms((await hour('2023-03-20', 'compline')).parts)).toEqual(['Salmo 90(91)'])
  })

  it('is kept the Saturday before Palm Sunday when 19 March is in Holy Week', async () => {
    expect(text((await hour('2035-03-16', 'vespers')).parts, 'head-hour')).toBe('I Vésperas')
    expect(text((await hour('2035-03-17', 'lauds')).parts, 'head-title')).toMatch(/^SÃO JOSÉ/)
    expect((await hour('2035-03-17', 'vespers')).office.celebration?.id).toBe(ids.palmSunday)
    expect((await hour('2035-03-19', 'lauds')).office.celebration).toBeUndefined()
  })
})

describe('All Saints on a Saturday', () => {
  it('keeps its own second Vespers', async () => {
    const { office, parts } = await hour('2025-11-01', 'vespers')
    expect(office.celebration?.id).toBe(ids.allSaints)
    expect(office.sundayEve).toBe(false)
    expect(text(parts, 'head-hour')).toBe('II Vésperas')
    expect(text(parts, 'intro')).toMatch(/Amém\. Aleluia\.$/)
  })

  it('has the complementary psalms at the little hours, and the Sunday psalm on a Sunday (229)', async () => {
    expect(psalms((await hour('2025-11-01', 'terce')).parts)).toEqual([
      'Salmo 119(120)',
      'Salmo 120(121)',
      'Salmo 121(122)',
    ])
    expect(psalms((await hour('2025-11-01', 'none')).parts)[0]).toBe('Salmo 125(126)')
    expect(psalms((await hour('2026-11-01', 'terce')).parts)[0]).toMatch(/^Salmo 117/)
  })
})

describe('the verse that opens an hour (79)', () => {
  it('ends with Aleluia in every hour of 2020-2040 but in Lent', async () => {
    const faults: string[] = []
    for (let date = on('2020-01-01'); date.getFullYear() <= 2040; date = addDays(date, 1)) {
      for (const of of hours) {
        if (of === 'invitatory') continue
        const office = officeOf(date, of, calendar)
        const lent =
          office.day.season === 'lent' ||
          office.day.season === 'holy-week' ||
          office.celebration?.id === ids.easterSunday
        for (const form of formsOf(office)) {
          const parts = await assembleHour(office, form, corpus)
          const said = /agora e sempre\. Amém\.(\s*Aleluia)?/.exec(text(parts, 'intro'))
          if (
            said &&
            Boolean(said[1]) === lent &&
            !(office.celebration?.id === ids.easterSunday && !office.firstVespers)
          )
            faults.push(`${date.toDateString()} ${of} ${form}`)
        }
      }
    }
    expect(faults).toEqual([])
  }, 300_000)
})

describe('a memorial in Lent, on 17-24 December and in the octave of Christmas (237-239)', () => {
  it('leaves every hour the weekday’s, the Invitatory too', async () => {
    for (const iso of ['2020-03-17', '2020-12-21', '2020-12-29']) {
      const day = lothDay(on(iso), calendar)
      expect(day.celebration?.rank).toBe('memorial')
      for (const of of hours) {
        const office = officeOf(on(iso), of, calendar)
        expect(isCommemoration(office)).toBe(true)
        expect(formsOf(office)[0]).toBe('season')
      }
      expect(formsOf(officeOf(on(iso), 'terce', calendar))).toEqual(['season'])
    }
    expect(text((await hour('2020-03-17', 'invitatory')).parts, 'psalm-1')).toMatch(
      /Cristo por nós foi tentado/,
    )
  })

  it('adds the saint’s antiphon and prayer after the prayer of Lauds and Vespers', async () => {
    for (const of of ['lauds', 'vespers'] as const) {
      const weekday = await hour('2020-03-17', of, 'season')
      const kept = await hour('2020-03-17', of, 'celebration')
      const added = ['commemoration', 'commemoration-ant', 'commemoration-prayer']
      expect(kept.parts.filter((part) => !added.includes(part.slot))).toEqual(weekday.parts)
      const at = kept.slots.indexOf('prayer')
      expect(kept.slots.slice(at, at + 5)).toEqual(['prayer', ...added, 'conclusion'])
      expect(text(kept.parts, 'commemoration')).toBe('Comemoração: São Patrício, bispo')
      expect(text(kept.parts, 'commemoration-prayer')).toMatch(/povos da Irlanda/)
    }
  })

  it('adds the saint’s reading after the second and ends with the saint’s prayer at the Office of Readings', async () => {
    const weekday = await hour('2020-03-17', 'readings', 'season')
    const kept = await hour('2020-03-17', 'readings', 'celebration')
    const at = kept.slots.indexOf('responsory-2')
    expect(kept.slots.slice(at, at + 4)).toEqual([
      'responsory-2',
      'commemoration',
      'commemoration-reading',
      'commemoration-responsory',
    ])
    expect(text(kept.parts, 'reading-2')).toBe(text(weekday.parts, 'reading-2'))
    expect(text(kept.parts, 'commemoration-reading')).toMatch(/^Da Confissão de São Patrício/)
    expect(text(kept.parts, 'prayer')).toMatch(/povos da Irlanda/)
  })

  it('keeps the Te Deum of the octave of Christmas (68)', async () => {
    const kept = await hour('2020-12-29', 'readings', 'celebration')
    expect(kept.slots).toContain('te-deum')
    expect(kept.slots.indexOf('commemoration-reading')).toBeLessThan(kept.slots.indexOf('te-deum'))
  })

  it('is a memorial like any other outside those days', async () => {
    const office = officeOf(on('2020-01-17'), 'lauds', calendar)
    expect(isCommemoration(office)).toBe(false)
    expect(formsOf(office)).toEqual(['celebration', 'season'])
  })
})
