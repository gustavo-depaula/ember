// An hour put together: its slots in order, each from the most particular
// layer of the corpus that knows the day.

import type { LothCalendar } from './day'
import {
  type Form,
  type HourIndex,
  type InvitatoryPsalm,
  lookup,
  officeKey,
  type PartBundle,
} from './index-types'
import type { Hour, Office } from './office'
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
}

// The hours a memorial changes: the others are the weekday's either way.
const hoursOfAMemorial = new Set<Hour>(['readings', 'lauds', 'vespers'])

/**
 * The offices an hour may be prayed in, the one the book gives first. A
 * memorial is the saint's office or the season's weekday, and an optional one
 * leaves the weekday first. The Invitatory is always the saint's.
 */
export function formsOf(office: Office): Form[] {
  const c = office.celebration
  if (!c) return ['season']
  if (c.rank !== 'memorial' || office.hour === 'invitatory') return ['celebration']
  if (!hoursOfAMemorial.has(office.hour)) return [c.obligatory ? 'celebration' : 'season']
  return c.obligatory ? ['celebration', 'season'] : ['season', 'celebration']
}

export async function assembleHour(
  office: Office,
  form: Form,
  source: LothSource,
  psalm?: InvitatoryPsalm,
): Promise<HourPart[]> {
  const index = await source.index(office.hour)
  if (!index) return []
  const key = officeKey(office, form, psalm)
  const refs = index.order
    .map((slot) => ({ slot, ref: lookup(index.slots[slot], key) }))
    .filter((part): part is { slot: string; ref: string } => Boolean(part.ref))
  return Promise.all(
    refs.map(async ({ slot, ref }) => {
      const dot = ref.lastIndexOf('.')
      const bundle = await source.parts(ref.slice(0, dot))
      const blocks = bundle?.parts[Number(ref.slice(dot + 1))]
      if (!blocks) throw new Error(`Liturgy of the Hours: part ${ref} is missing from the corpus`)
      return { slot, blocks }
    }),
  )
}
