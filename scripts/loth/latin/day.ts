// The Latin one day of iBreviary gives each part of an hour, checked: the
// parts of the Brazilian corpus (by their place in it) and the Latin each was
// found to be.

import { addDays, easterSunday } from '../../../packages/liturgical/src/of-temporal'
import {
  assembleHour,
  formsOf,
  type Hour,
  ids,
  type LothSource,
  officeOf,
} from '../../../packages/loth/src/index'
import { parseHourPage } from '../../../apps/app/src/sources/ibreviary/parse'
import { officesOf } from '../../../apps/app/src/sources/loth/hour'
import type { Primitive } from '../../../apps/app/src/content/primitives'
import {
  baseOf,
  type LatinSection,
  pairInvitatory,
  latinTexts,
  pairPart,
  type StoredLatin,
  storedLatin,
} from '../../../apps/app/src/sources/loth/pair'
import { renderParts, renderSlots } from '../../../apps/app/src/sources/loth/render'
import { latinSections } from './sections'
import { citation } from './books'
import { confirmed } from './corrections'
import { latinKeys, officeKeys, pairForms } from './verify'

// Only what is said, but for the Invitatory, whose red lines tell its
// antiphon from its psalm.
function stored(section: LatinSection): StoredLatin {
  if (section.slot === 'invitatory') return storedLatin(section)
  const said = section.body.filter((p) => p.type !== 'rubric')
  // A prayer ends at its Amen: iBreviary may print another after it (the
  // Mass's, a season's other).
  const amen = said.findIndex(
    (p) => p.type === 'verses' && /^Amen\.?$/.test(p.items[0]?.text.primary.trim() ?? ''),
  )
  const body = section.slot === 'prayer' && amen !== -1 ? said.slice(0, amen + 1) : said
  // A stray point or colon left before a text by the red label it followed.
  const clean = (text: string) => text.replace(/^[\s.:;,]+/, '')
  return storedLatin({
    ...section,
    body: body.map((p): Primitive => {
      if (p.type === 'text') return { ...p, text: { ...p.text, primary: clean(p.text.primary) } }
      if (p.type === 'verses')
        return { ...p, items: p.items.map((item) => ({ ...item, text: { ...item.text, primary: clean(item.text.primary) } })) }
      return p
    }),
  })
}

/**
 * @param page the hour as iBreviary names it ('office-of-readings', 'lauds'…)
 * @param html iBreviary's page for it, in Latin
 */
export async function latinOfDay(
  date: Date,
  hour: Hour,
  page: string,
  html: string,
  source: LothSource,
  // Each part said that day, given its Latin or not.
  seen?: (ref: string) => void,
  // The Latin is another day's, which may be another saint's of the same
  // Common: only what carries its own numbers.
  elsewhere = false,
): Promise<{ ref: string; slot: string; latin: StoredLatin }[]> {
  let sections: LatinSection[]
  try {
    sections = latinSections(parseHourPage(html, page as never, 'la'))
  } catch {
    return [] // a page iBreviary left empty
  }
  const { office, ctx, forms } = await officesOf(date, hour, source)
  // A memorial's little hours and Night Prayer are the weekday's in the
  // Latin (General Instruction, 236), whatever the Brazilian takes from the
  // saint.
  const weekday =
    office.celebration?.rank === 'memorial' && !forms.some(({ form }) => form === 'season')
      ? {
          form: 'season' as const,
          slots: renderSlots(await assembleHour(office, 'season', source), ctx),
        }
      : undefined
  const { forms: paired, latinOffice } = pairForms(forms, sections, {
    penitential: ['advent', 'lent', 'holy-week'].includes(office.day.season),
    weekday,
    onlyOrdinary:
      hour === 'compline' && office.day.season === 'holy-week' && office.day.weekday >= 4,
  })
  const out: { ref: string; slot: string; latin: StoredLatin }[] = []
  const give = (ref: string | undefined, section: LatinSection | undefined) => {
    if (ref && section) out.push({ ref, slot: section.slot, latin: stored(section) })
  }
  const trusted = (slot: string) =>
    !elsewhere || /^(psalm-\d+|reading(-\d+)?|responsory-\d+)$/.test(slot)
  for (const f of paired)
    for (const part of f.slots) {
      if (part.ref) seen?.(part.ref)
      if (!trusted(part.slot)) continue
      give(part.ref, part.latin)
      if (!elsewhere) part.latinChoices?.forEach((section, i) => give(part.choiceRefs?.[i], section))
    }
  // A part read beside the Latin of its slot and found the same text, where
  // the day's office could not be told the Latin's by its numbers.
  const given = new Set(out.map((g) => g.ref))
  if (!elsewhere)
    for (const f of forms)
      for (const { ref, slot, primitives } of f.slots) {
        if (!ref || given.has(ref) || !confirmed.has(ref)) continue
        const opening = confirmed.get(ref)
        const section = sections.find(
          (s) => s.slot === baseOf(slot) && latinTexts(s.body).join(' ').replace(/\s+/g, ' ').trim().startsWith(opening ?? ''),
        )
        if (opening && section && pairPart(slot, primitives, section)) {
          give(ref, section)
          given.add(ref)
        }
      }
  // The Invitatory with Psalm 94(95), where its antiphon is the Latin day's.
  const invitatory = sections.find((s) => s.slot === 'invitatory')
  if (invitatory && !elsewhere && (hour === 'readings' || hour === 'lauds')) {
    const inv = officeOf(date, 'invitatory', await source.calendar())
    const [own] = formsOf(inv)
    if (latinOffice === own) {
      const parts = await assembleHour(inv, own, source, '94c')
      const psalm = parts.find((p) => p.slot === 'psalm-1')
      const said = pairInvitatory(renderParts(psalm ? [psalm] : [], ctx), invitatory)
      const antiphon = said.some(
        (p) => p.type === 'verses' && p.items.length === 1 && p.items[0].text.secondary,
      )
      if (antiphon) give(psalm?.ref, invitatory)
    }
  }
  return out
}

/** The keys of iBreviary's Latin hour, to find it from another day's. */
export function keysOfLatin(hour: Hour, page: string, html: string): string[] {
  try {
    return latinKeys(hour, latinSections(parseHourPage(html, page as never, 'la')))
  } catch {
    return []
  }
}

/** The keys of the Brazilian hour of a date. */
export async function keysOfDay(date: Date, hour: Hour, source: LothSource): Promise<string[]> {
  return officeKeys(hour, (await officesOf(date, hour, source)).forms)
}

// A Father's reading is cited by the edition it is read in, its work and
// pages: "(Oratio 43, in laudem Basilii Magni, 15. 16-17: PG 36, 514-523)".
const citedNumbers = (text: string) =>
  (text.replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2').match(/\d+/g) ?? []).join('.')

/** The key a reading or responsory is cited by, in either edition. */
export function citedKey(slot: string, cite: string, edition: 'brazilian' | 'latin'): string | undefined {
  if (slot === 'reading-2') return cite.trim().startsWith('(') ? `father ${citedNumbers(cite)}` : undefined
  const bible = citation(cite, edition)
  if (!bible) return undefined
  return `${slot.startsWith('responsory') ? 'responsory' : 'reading'} ${bible}`
}

/** The readings and responsories of iBreviary's Latin hour, by citation. */
export function citedOfLatin(page: string, html: string): { key: string; latin: StoredLatin }[] {
  let sections: LatinSection[]
  try {
    sections = latinSections(parseHourPage(html, page as never, 'la'))
  } catch {
    return []
  }
  return sections.flatMap((section) => {
    if (!/^(reading|reading-2|responsory-\d+)$/.test(section.slot) || !section.title) return []
    const key = citedKey(section.slot, section.title, 'latin')
    return key ? [{ key, latin: stored(section) }] : []
  })
}

// Where a calendar may keep the celebrations Brazil keeps on another day: a
// saint's on his date, the Epiphany on 6 January or the Sunday after the 1st,
// the Ascension and Corpus Christi on their Thursday or on the Sunday after.
function datesOf(id: string, year: number, fixed: Record<string, string>): Date[] {
  const easter = easterSunday(year)
  const on = (month: number, day: number) => new Date(year, month - 1, day, 12)
  if (id === ids.ascension) return [addDays(easter, 39), addDays(easter, 42)]
  if (id === ids.corpusChristi) return [addDays(easter, 60), addDays(easter, 63)]
  if (id === ids.epiphany) {
    const second = on(1, 2)
    return [on(1, 6), addDays(second, (7 - second.getDay()) % 7)]
  }
  const day = Object.entries(fixed).find(([, value]) => value === id)?.[0]
  return day ? [on(Number(day.slice(0, 2)), Number(day.slice(3)))] : []
}

/**
 * The days another calendar may keep this hour's celebration on, where it is
 * one Brazil keeps elsewhere: the Latin of those days is the same office.
 * First Vespers are the evening before.
 */
export async function otherDaysOf(date: Date, hour: Hour, source: LothSource): Promise<Date[]> {
  const calendar = await source.calendar()
  const office = officeOf(date, hour, calendar)
  const id = office.celebration?.id
  if (!id) return []
  const feast = office.firstVespers ? addDays(date, 1) : date
  const iso = (d: Date) => d.toDateString()
  return datesOf(id, feast.getFullYear(), calendar.fixed)
    .filter((d) => iso(d) !== iso(feast))
    .map((d) => (office.firstVespers ? addDays(d, -1) : d))
}
