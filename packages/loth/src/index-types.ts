// The shapes of `content/loth/`: how an hour is found from its day.
//
// An hour is a list of parts (hymn, each psalm and its antiphon, reading,
// prayer…). Each part is looked up on its own, through layers that run from
// what never changes (the Ordinary) through the psalter and the season to
// what one celebration alone has. The most particular layer that knows the
// day wins, which is how the book itself is laid out.

import type { Office } from './office'
import type { Block } from './text'

// The coordinates a part may depend on. One letter each: they are the column
// names of every layer in the corpus.
//   s season · w week of the season · d weekday · D Sunday or weekday
//   p week of the psalter
//   c Sunday cycle (A/B/C) · y year of the readings (I/II) · k date (MM-DD,
//   Advent and Christmas) · g evening kind (first Vespers, Sunday eve)
//   a eve of Advent · v psalm of the Invitatory
// and, on a day that keeps a celebration:
//   r its rank · K the Common it draws on · C the celebration itself
export type Field =
  | 's'
  | 'w'
  | 'd'
  | 'D'
  | 'p'
  | 'c'
  | 'y'
  | 'k'
  | 'g'
  | 'a'
  | 'v'
  | 'r'
  | 'K'
  | 'C'

// The coordinates only a celebration has, the most particular first. A layer
// is filed under the first of them it names, and says nothing about a day
// that lacks it: a saint with no Common has no place in a Common's layer.
const ofACelebration: Field[] = ['C', 'K', 'r']

export function applies(layer: Layer, key: OfficeKey): boolean {
  const under = ofACelebration.find((f) => layer.fields.includes(f))
  return !under || key[under] !== ''
}

export type OfficeKey = Record<Field, string>

export const invitatoryPsalms = ['94c', '94s', '23c', '23s', '66c', '66s', '99c', '99s'] as const
export type InvitatoryPsalm = (typeof invitatoryPsalms)[number]

// Whose office is prayed where the day allows more than one: the season's
// weekday; the saint's, with what he lacks from his Common; or the saint's
// with what he lacks from the weekday.
export type Form = 'season' | 'celebration' | 'celebration-of-the-weekday'

export function officeKey(office: Office, form: Form, psalm: InvitatoryPsalm = '94c'): OfficeKey {
  const { day } = office
  const kept = form === 'season' ? undefined : office.celebration
  return {
    s: day.season,
    w: String(day.week),
    d: String(day.weekday),
    D: day.weekday === 0 ? 'sunday' : 'weekday',
    p: String(day.psalterWeek),
    c: day.cycle,
    y: office.hour === 'readings' ? day.readingsYear : '',
    k: office.dateKey ?? '',
    g: office.firstVespers ? 'first' : office.sundayEve ? 'eve' : '',
    a: office.adventEve ? '1' : '',
    v: office.hour === 'invitatory' ? psalm : '',
    r: kept?.rank ?? '',
    K: kept?.common ?? '',
    C: kept?.id ?? '',
  }
}

export interface Layer {
  // The coordinates this layer is filed under.
  fields: Field[]
  // The coordinates' values joined by '|' -> a part; '' where the hour has no
  // such part that day.
  entries: Record<string, string>
}

export interface HourIndex {
  // Every slot the hour can have after its opening, in the order they are prayed.
  order: string[]
  // Slot -> its layers, the most general first. `@head` gives, instead of a
  // part, the slots that open the hour that day, in their order; `whole`, the
  // few hours laid out unlike any other, as one part.
  slots: Record<string, Layer[]>
  // Where the book leaves a part to choice (the two hymns of a little hour),
  // slot -> the sets of parts one of which is said.
  choices?: Record<string, Choice[]>
  // Slot -> the parts filed under a saint that are a Common's all the same
  // (the Commons offer more texts than one, and no layer of a Common holds
  // what only some of its saints take).
  ofTheCommons?: Record<string, string[]>
}

export interface Choice {
  // The parts to choose among, in the book's order.
  among: string[]
  // A part that prints them all, one after another with "Ou:" between.
  together?: string
}

// A part is referred to as `<bundle>.<n>`: the n-th part of that bundle.
export interface PartBundle {
  parts: Block[][]
}

export const project = (key: OfficeKey, fields: Field[]) => fields.map((f) => key[f]).join('|')

/** The most particular layer that knows this key. */
export function answering(layers: Layer[] | undefined, key: OfficeKey): Layer | undefined {
  if (!layers) return undefined
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]
    if (applies(layer, key) && layer.entries[project(key, layer.fields)] !== undefined) return layer
  }
  return undefined
}

/** The entry of the most particular layer that knows this key. */
export function lookup(layers: Layer[] | undefined, key: OfficeKey): string | undefined {
  const layer = answering(layers, key)
  return layer?.entries[project(key, layer.fields)]
}

// What a day must share with a day already checked for its hour to be taken
// as checked too. An hour is put together from what the season gives and
// what the celebration adds; each half is known where it has been met.
//
// The season's half: this week and weekday of this season (this date, in
// Advent and Christmas time), at this hour of the evening; on a Sunday or its
// eve, in this year of the cycle; at the Office of Readings, in this year of
// its own.
export function seasonCoverage(key: OfficeKey): string {
  const sunday = key.d === '0' || key.g !== ''
  return [key.s, key.w, key.d, key.p, key.k, key.g, key.a, sunday ? key.c : '', key.y].join('|')
}

// The celebration's half: this celebration in this season, on a Sunday or a
// weekday, at this hour of the evening. A saint met only in Ordinary Time is
// not known in Easter time, where his antiphons may change.
export function celebrationCoverage(key: OfficeKey): string | undefined {
  return key.C ? [key.C, key.s, key.D, key.g].join('|') : undefined
}
