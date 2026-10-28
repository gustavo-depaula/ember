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
    expect(formsOf(office)).toEqual(['celebration', 'season', 'celebration-of-the-weekday'])
  })
})

// Whose each part of an hour is (`rules.ts`). The years after the reference
// are swept, where nothing but the rule can have put the weekday's part
// under the saint's name.
describe('the weekday’s parts on a saint’s day (225-236)', () => {
  const body = (parts: HourPart[], slot: (name: string) => boolean) =>
    parts
      .filter((part) => !part.slot.startsWith('head') && slot(part.slot))
      .map((part) => `${part.slot}: ${part.blocks.map(blockText).join('\n')}`)
  const isPsalmody = (slot: string) => /^(psalmody|ant-\d|psalm-\d|collect-\d)/.test(slot)
  const ownPsalmody = new Set(['01-21', '08-29', '09-15', '10-02', '10-07', '11-11'])
  const ownLittleHours = new Set(['06-11', '10-02'])

  it('gives a memorial the weekday’s psalms, first reading, little hours and Night Prayer', async () => {
    const differences: string[] = []
    for (let date = on('2041-01-01'); date.getFullYear() <= 2050; date = addDays(date, 1)) {
      for (const of of hours) {
        const office = officeOf(date, of, calendar)
        const kept = office.celebration
        if (kept?.rank !== 'memorial' || isCommemoration(office) || of === 'invitatory') continue
        const saint = kept.id.replace('sanctorale.', '')
        const little = of === 'terce' || of === 'sext' || of === 'none'
        const weekdays = (() => {
          if (of === 'compline') return () => true
          if (little) return ownLittleHours.has(saint) ? isPsalmody : () => true
          if (of === 'readings')
            return (slot: string) =>
              isPsalmody(slot) || ['verse', 'reading-1', 'responsory-1'].includes(slot)
          return ownPsalmody.has(saint) ? () => false : isPsalmody
        })()
        const [own, weekday] = await Promise.all([
          assembleHour(office, 'celebration', corpus),
          assembleHour(office, 'season', corpus),
        ])
        if (body(own, weekdays).join('\n') !== body(weekday, weekdays).join('\n'))
          differences.push(`${date.toDateString()} ${of} ${kept.id}`)
      }
    }
    expect(differences).toEqual([])
  })

  it('says a feast’s little hour under its one antiphon, with the weekday’s psalms', async () => {
    // The Exaltation of the Cross on a Friday, whose psalm at Terce is one
    // psalm in three sections.
    const feast = await hour('2046-09-14', 'terce')
    const weekday = await hour('2046-08-17', 'terce')
    expect(psalms(feast.parts)).toEqual(psalms(weekday.parts))
    expect(feast.slots.filter((slot) => slot.startsWith('ant-'))).toEqual(['ant-1', 'ant-3-end'])
    expect(text(feast.parts, 'ant-1')).toMatch(/^Ant\. Salvai-nos por vossa santa Cruz/)
    expect(text(feast.parts, 'ant-3-end')).toBe(text(feast.parts, 'ant-1'))
    expect(text(feast.parts, 'reading')).not.toBe(text(weekday.parts, 'reading'))
  })

  it('gives a feast the weekday’s Night Prayer', async () => {
    const feast = await hour('2044-08-24', 'compline')
    const weekday = await hour('2044-08-31', 'compline')
    expect(body(feast.parts, () => true)).toEqual(body(weekday.parts, () => true))
  })

  it('gives the night of a solemnity’s Saturday to the Sunday, as its Vespers are', async () => {
    // The Immaculate Conception on a Saturday of Advent.
    expect((await hour('2029-12-08', 'vespers')).office.sundayEve).toBe(true)
    const night = await hour('2029-12-08', 'compline')
    expect(night.office.celebration).toBeUndefined()
    expect(psalms(night.parts)).toEqual(['Salmo 4', 'Salmo 133(134)'])
    expect(psalms((await hour('2031-12-08', 'compline')).parts)).toEqual(['Salmo 90(91)'])
  })
})

describe('the two hymns of a little hour and of Night Prayer', () => {
  const firstLines = (part: HourPart | undefined) =>
    part?.choices?.map((blocks) => blockText(blocks[1]).split('\n')[0])

  it('offers both, the one the breviary prints that day first shown', async () => {
    const hymnOf = async (iso: string, of: Hour) =>
      (await hour(iso, of)).parts.find((part) => part.slot === 'hymn')
    expect(firstLines(await hymnOf('2026-10-08', 'terce'))).toEqual([
      'Vinde, Espírito de Deus,',
      'Mantendo a ordem certa,',
    ])
    expect(firstLines(await hymnOf('2026-10-08', 'sext'))).toEqual([
      'Ó Deus, verdade e força',
      'O louvor de Deus cantemos',
    ])
    expect(firstLines(await hymnOf('2026-10-08', 'none'))).toEqual([
      'Vós que sois o Imutável,',
      'Cumprindo o ciclo tríplice das horas,',
    ])
    // Night Prayer in Ordinary Time is printed with both; in Lent with one.
    const ordinary = await hymnOf('2026-10-08', 'compline')
    expect(firstLines(ordinary)).toEqual([
      'Agora que o clarão da luz se apaga,',
      'Ó Cristo, dia e esplendor,',
    ])
    expect(ordinary?.chosen).toBe(0)
    const lent = await hymnOf('2026-03-03', 'compline')
    expect(firstLines(lent)).toEqual(firstLines(ordinary))
    expect(blockText((lent?.blocks ?? [])[1]).split('\n')[0]).toBe(
      firstLines(lent)?.[lent?.chosen ?? 0],
    )
  })

  it('offers none where the season has a hymn of its own', async () => {
    const easter = (await hour('2026-04-21', 'terce')).parts.find((part) => part.slot === 'hymn')
    expect(easter?.choices).toBeUndefined()
  })
})

describe('a memorial with the weekday’s in place of the Common’s (235)', () => {
  const taken = [
    'hymn',
    'reading',
    'responsory',
    'canticle-ant',
    'canticle-ant-end',
    'intercessions',
  ]
  const said = (parts: HourPart[], slot: string) => text(parts, slot)

  it('keeps what the saint has of his own, his reading and his prayer', async () => {
    // Saint Augustine: a hymn and antiphons of his own, the rest from the
    // Common of pastors.
    const [saint, weekday, mixed] = await Promise.all(
      (['celebration', 'season', 'celebration-of-the-weekday'] as const).map((form) =>
        hour('2026-08-28', 'lauds', form),
      ),
    )
    expect(said(mixed.parts, 'hymn')).toBe(said(saint.parts, 'hymn'))
    expect(said(mixed.parts, 'canticle-ant')).toBe(said(saint.parts, 'canticle-ant'))
    expect(said(mixed.parts, 'prayer')).toBe(said(saint.parts, 'prayer'))
    expect(said(mixed.parts, 'reading')).toBe(said(weekday.parts, 'reading'))
    expect(said(mixed.parts, 'responsory')).toBe(said(weekday.parts, 'responsory'))
    expect(said(mixed.parts, 'intercessions')).toBe(said(weekday.parts, 'intercessions'))
    expect(said(mixed.parts, 'head-title')).toMatch(/^SANTO AGOSTINHO/)
    expect(mixed.slots).not.toContain('head-common')
    const readings = await hour('2026-08-28', 'readings', 'celebration-of-the-weekday')
    expect(said(readings.parts, 'reading-2')).toBe(
      said((await hour('2026-08-28', 'readings', 'celebration')).parts, 'reading-2'),
    )
  })

  it('is, part for part, the saint’s office or the weekday’s, in every memorial of ten years', async () => {
    const differences: string[] = []
    for (let date = on('2041-01-01'); date.getFullYear() <= 2050; date = addDays(date, 1)) {
      for (const of of ['readings', 'lauds', 'vespers'] as const) {
        const office = officeOf(date, of, calendar)
        if (!formsOf(office).includes('celebration-of-the-weekday') || isCommemoration(office))
          continue
        const [saint, weekday, mixed] = await Promise.all(
          (['celebration', 'season', 'celebration-of-the-weekday'] as const).map((form) =>
            assembleHour(office, form, corpus),
          ),
        )
        for (const part of mixed) {
          if (part.slot === 'head-common')
            differences.push(`${date.toDateString()} ${of} names a Common`)
          const from = taken.includes(part.slot.replace(/~\d+$/, '')) ? [saint, weekday] : [saint]
          if (!from.some((parts) => said(parts, part.slot) === said(mixed, part.slot)))
            differences.push(`${date.toDateString()} ${of} ${part.slot}`)
        }
        // The antiphon before its canticle and after it are one saint's or
        // one weekday's, and no hour is left without a part the saint's has.
        const antiphons = (parts: HourPart[]) =>
          `${said(parts, 'canticle-ant')}|${said(parts, 'canticle-ant-end')}`
        if (![saint, weekday].some((parts) => antiphons(parts) === antiphons(mixed)))
          differences.push(`${date.toDateString()} ${of} antiphon`)
        for (const slot of ['hymn', 'prayer'])
          if (!said(mixed, slot)) differences.push(`${date.toDateString()} ${of} no ${slot}`)
      }
    }
    expect(differences).toEqual([])
  })
})
