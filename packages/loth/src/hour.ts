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

export interface HourPart {
  // 'hymn', 'psalm-2', 'ant-2', 'reading', 'canticle', 'prayer'… A slot met a
  // second time in one hour is numbered: 'prayer~2'.
  slot: string
  blocks: Block[]
}

/**
 * The offices an hour may be prayed in, the one the book gives first. A
 * memorial is the saint's office or the season's weekday; an optional one
 * leaves the weekday first.
 */
export function formsOf(office: Office): Form[] {
  const c = office.celebration
  if (!c) return ['season']
  if (c.rank !== 'memorial') return ['celebration']
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
