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
//   s season · w week of the season · d weekday · p week of the psalter
//   c Sunday cycle (A/B/C) · y year of the readings (I/II) · k date (MM-DD,
//   Advent and Christmas) · g evening kind (first Vespers, Sunday eve)
//   a eve of Advent · C celebration · v psalm of the Invitatory
export type Field = 's' | 'w' | 'd' | 'p' | 'c' | 'y' | 'k' | 'g' | 'a' | 'C' | 'v'

export type OfficeKey = Record<Field, string>

export const invitatoryPsalms = ['94c', '94s', '23c', '23s', '66c', '66s', '99c', '99s'] as const
export type InvitatoryPsalm = (typeof invitatoryPsalms)[number]

// Whose office is prayed where the day allows two: the season's weekday, or
// the saint's.
export type Form = 'season' | 'celebration'

export function officeKey(office: Office, form: Form, psalm: InvitatoryPsalm = '94c'): OfficeKey {
  const { day } = office
  return {
    s: day.season,
    w: String(day.week),
    d: String(day.weekday),
    p: String(day.psalterWeek),
    c: day.cycle,
    y: office.hour === 'readings' ? day.readingsYear : '',
    k: office.dateKey ?? '',
    g: office.firstVespers ? 'first' : office.sundayEve ? 'eve' : '',
    a: office.adventEve ? '1' : '',
    C: form === 'celebration' ? (office.celebration?.id ?? '') : '',
    v: office.hour === 'invitatory' ? psalm : '',
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
  // Every slot the hour can have, in the order they are prayed.
  order: string[]
  // Slot -> its layers, the most general first.
  slots: Record<string, Layer[]>
}

// A part is referred to as `<bundle>.<n>`: the n-th part of that bundle.
export interface PartBundle {
  parts: Block[][]
}

export const project = (key: OfficeKey, fields: Field[]) => fields.map((f) => key[f]).join('|')

/** The entry of the most particular layer that knows this key. */
export function lookup(layers: Layer[] | undefined, key: OfficeKey): string | undefined {
  if (!layers) return undefined
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]
    // A layer of one celebration says nothing about a day without it.
    if (layer.fields.includes('C') && !key.C) continue
    const hit = layer.entries[project(key, layer.fields)]
    if (hit !== undefined) return hit
  }
  return undefined
}
