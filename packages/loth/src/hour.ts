// An hour put together: its slots in order, each from the most particular
// layer of the corpus that knows the day.

import type { LothCalendar } from './day'
import {
  answering,
  type Form,
  type HourIndex,
  type InvitatoryPsalm,
  lookup,
  type OfficeKey,
  officeKey,
  type PartBundle,
  project,
} from './index-types'
import type { Hour, Office } from './office'
import { partOf } from './rules'
import type { Block } from './text'

export interface LothSource {
  calendar: () => Promise<LothCalendar>
  index: (hour: Hour) => Promise<HourIndex | undefined>
  parts: (bundle: string) => Promise<PartBundle | undefined>
  // The complementary texts the hours link to, by id.
  extras: () => Promise<Record<string, Block[]>>
}

// The years every hour was checked against the breviary the corpus was drawn
// from (`__tests__/reference.json`). Outside them an hour is still put together
// from layers that were each checked, but a day of a kind those years never
// had may read differently from the book.
export const verified = { from: '2020-01-01', to: '2040-12-31' } as const

export function isVerified(date: Date): boolean {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return iso >= verified.from && iso <= verified.to
}

export interface HourPart {
  // 'hymn', 'psalm-2', 'ant-2', 'reading', 'canticle', 'prayer'… A slot met a
  // second time in one hour is numbered: 'prayer~2'.
  slot: string
  blocks: Block[]
  // A text the archive the corpus was drawn from left out of its hours and
  // that came from elsewhere (`supplied-*` bundles): outside what the
  // reference checks.
  supplied?: true
  // Where the book leaves the part to choice (the two hymns of a little
  // hour): the texts to choose among, in the book's order. `blocks` is the
  // part as the archive prints it, one of them or all in a row.
  choices?: Block[][]
  // The one of `choices` the archive prints that day; the first where it
  // prints them all.
  chosen?: number
}

// The hours a memorial changes: the others are the weekday's either way.
const hoursOfAMemorial = new Set<Hour>(['readings', 'lauds', 'vespers'])

/**
 * In Lent, from 17 to 24 December and in the octave of Christmas no memorial
 * is kept: the office is the weekday's, and one who wishes may add the saint
 * to it (General Instruction, 237-239).
 */
export function isCommemoration(office: Office): boolean {
  if (office.celebration?.rank !== 'memorial') return false
  const { season, date } = office.day
  const december = date.getMonth() === 11 ? date.getDate() : 0
  return season === 'lent' || (season === 'advent' && december >= 17) || december >= 26
}

/**
 * The offices an hour may be prayed in, the one the book gives first. A
 * memorial is the saint's office or the season's weekday, and an optional one
 * leaves the weekday first. The Invitatory is always the saint's. Where the
 * saint may only be commemorated, the second is the weekday's with the
 * commemoration added.
 *
 * What a memorial has not of its own is taken "from the Common or from the
 * current weekday" (General Instruction, 235): the saint's office is the
 * first of the two, and last comes the same office with the weekday's.
 */
export function formsOf(office: Office): Form[] {
  const c = office.celebration
  if (!c) return ['season']
  if (isCommemoration(office))
    return hoursOfAMemorial.has(office.hour) ? ['season', 'celebration'] : ['season']
  if (c.rank !== 'memorial' || office.hour === 'invitatory') return ['celebration']
  if (!hoursOfAMemorial.has(office.hour)) return [c.obligatory ? 'celebration' : 'season']
  return c.obligatory
    ? ['celebration', 'season', 'celebration-of-the-weekday']
    : ['season', 'celebration', 'celebration-of-the-weekday']
}

// The parts a memorial takes from the Common or from the weekday where the
// saint has none of his own (235). The responsory goes with its reading, and
// the antiphon is one before and after its canticle.
const fromCommonOrWeekday = ['hymn', 'reading', 'responsory', 'canticle-ant', 'intercessions']
const together: Record<string, string> = {
  responsory: 'reading',
  'canticle-ant-end': 'canticle-ant',
}

/**
 * Whether the saint has this part of his own, and not from his Common: it is
 * filed under him, and is neither what a layer of a Common or a rank gives nor
 * a text of the Commons themselves.
 */
function isTheSaintsOwn(index: HourIndex, slot: string, key: OfficeKey): boolean {
  const layers = index.slots[slot]
  const layer = answering(layers, key)
  if (!layer?.fields.includes('C')) return false
  const part = layer.entries[project(key, layer.fields)]
  if (index.ofTheCommons?.[slot]?.includes(part)) return false
  return !layers.some(
    (other) => !other.fields.includes('C') && Object.values(other.entries).includes(part),
  )
}

async function parts(
  office: Office,
  form: Form,
  source: LothSource,
  psalm?: InvitatoryPsalm,
): Promise<HourPart[]> {
  const index = await source.index(office.hour)
  if (!index) return []
  const key = officeKey(office, form, psalm)
  // The few hours laid out unlike any other are kept whole, as one part.
  const whole = lookup(index.slots.whole, key)
  // What opens the hour is arranged day by day; the rest keeps one order.
  const opening = lookup(index.slots['@head'], key)?.split(' ') ?? []
  const find = (name: string, at: OfficeKey) => lookup(index.slots[name], at)
  // With the weekday's in place of the Common's: what the saint has of his
  // own stays, and the Common is not named over the hour.
  const ofTheWeekday = (slot: string) => {
    if (form !== 'celebration-of-the-weekday') return false
    if (slot === 'head-common') return true
    const name = slot.replace(/~\d+$/, '')
    const decides = together[name] ?? name
    return fromCommonOrWeekday.includes(decides) && !isTheSaintsOwn(index, decides, key)
  }
  const weekday = officeKey(office, 'season', psalm)
  // Whose each part is, the saint's or the weekday's, is the rule's to say.
  const refs = (whole ? ['whole'] : [...opening, ...index.order])
    .map((slot) => ({
      slot,
      ref: ofTheWeekday(slot)
        ? slot.startsWith('head')
          ? undefined
          : find(slot, weekday)
        : partOf(office.hour, slot, key, find),
    }))
    .filter((part): part is { slot: string; ref: string } => Boolean(part.ref))
  const blocksOf = async (ref: string) => {
    const dot = ref.lastIndexOf('.')
    const bundle = await source.parts(ref.slice(0, dot))
    const blocks = bundle?.parts[Number(ref.slice(dot + 1))]
    if (!blocks) throw new Error(`Liturgy of the Hours: part ${ref} is missing from the corpus`)
    return blocks
  }
  return Promise.all(
    refs.map(async ({ slot, ref }): Promise<HourPart> => {
      const blocks = await blocksOf(ref)
      if (ref.startsWith('supplied-')) return { slot, blocks, supplied: true }
      const choice = index.choices?.[slot]?.find((c) => c.among.includes(ref) || c.together === ref)
      if (!choice) return { slot, blocks }
      return {
        slot,
        blocks,
        choices: await Promise.all(choice.among.map(blocksOf)),
        chosen: Math.max(0, choice.among.indexOf(ref)),
      }
    }),
  )
}

// A part's heading ("Segunda leitura", "Oração") is its first block, a title.
const withoutHeading = (blocks: Block[]) => (blocks[0]?.k === 'title' ? blocks.slice(1) : blocks)

/**
 * The weekday's hour with the saint commemorated. At the Office of Readings
 * the saint's reading and responsory follow the weekday's second, and the
 * saint's prayer ends the hour; at Lauds and Vespers the saint's antiphon and
 * prayer follow the concluding prayer.
 */
async function withTheCommemoration(office: Office, source: LothSource): Promise<HourPart[]> {
  const [weekday, saint] = await Promise.all([
    parts(office, 'season', source),
    parts(office, 'celebration', source),
  ])
  const of = (slot: string) => saint.find((part) => part.slot === slot)
  const name: HourPart = {
    slot: 'commemoration',
    blocks: [
      {
        k: 'title',
        lines: [[`Comemoração: ${office.celebration?.title.replace(/\s*\n\s*/g, ' ')}`]],
      },
    ],
  }
  const prayer = of('prayer')
  if (!prayer)
    throw new Error(`Liturgy of the Hours: no prayer to commemorate ${office.celebration?.id} with`)
  if (office.hour === 'readings') {
    const reading = of('reading-2')
    const responsory = of('responsory-2')
    const after = weekday.findIndex((part) => part.slot === 'responsory-2')
    if (!reading || after < 0) return weekday
    return [
      ...weekday.slice(0, after + 1),
      name,
      { slot: 'commemoration-reading', blocks: withoutHeading(reading.blocks) },
      ...(responsory ? [{ slot: 'commemoration-responsory', blocks: responsory.blocks }] : []),
      ...weekday.slice(after + 1).map((part) => (part.slot === 'prayer' ? prayer : part)),
    ]
  }
  const antiphon = of('canticle-ant')
  const after = weekday.findIndex((part) => part.slot === 'prayer')
  if (after < 0) return weekday
  return [
    ...weekday.slice(0, after + 1),
    name,
    ...(antiphon ? [{ slot: 'commemoration-ant', blocks: antiphon.blocks }] : []),
    { slot: 'commemoration-prayer', blocks: prayer.blocks },
    ...weekday.slice(after + 1),
  ]
}

export async function assembleHour(
  office: Office,
  form: Form,
  source: LothSource,
  psalm?: InvitatoryPsalm,
): Promise<HourPart[]> {
  return form !== 'season' && isCommemoration(office)
    ? withTheCommemoration(office, source)
    : parts(office, form, source, psalm)
}
