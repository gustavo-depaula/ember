// Setting the chant of a Divinum Officium text beside it: shared by the Mass
// and the hours, which both arrive as items of Latin and are both searched for
// what in them is sung.

import type { Primitive } from '@/content/primitives'
import type { Chant } from '@/features/chant/chants'
import type { ChantGenre } from '@/features/chant/textKey'
import { mapItemsToPrimitives } from './blocks'

/** What a chant is in its liturgy, as its books head it. */
export const partNames: Record<ChantGenre, string> = {
  in: 'Introitus',
  gr: 'Graduale',
  al: 'Alleluia',
  tr: 'Tractus',
  of: 'Offertorium',
  co: 'Communio',
  se: 'Sequentia',
  an: 'Antiphona',
  hy: 'Hymnus',
  rb: 'Responsorium breve',
}

export function chantPrimitive(chant: Chant, part?: string): Primitive {
  return {
    type: 'chant',
    name: chant.name,
    part,
    mode: chant.mode,
    commentary: chant.commentary,
    book: chant.book,
    transcriber: chant.transcriber,
    score: chant.score,
  }
}

/**
 * The items as primitives, each followed by the chants `chantsOf` finds for
 * it. Items are mapped in runs that end at an item with chant; a run starts on
 * an item's own first line, which is where the mapper starts afresh anyway.
 */
export async function withChant(
  primary: string[],
  latin: string[],
  chantsOf: (latinItem: string) => Promise<Primitive[]>,
): Promise<Primitive[]> {
  const chants = await Promise.all(latin.map(chantsOf))
  const out: Primitive[] = []
  let start = 0
  chants.forEach((found, i) => {
    if (!found.length) return
    out.push(...mapItemsToPrimitives(primary.slice(start, i + 1), latin.slice(start, i + 1)))
    out.push(...found)
    start = i + 1
  })
  out.push(...mapItemsToPrimitives(primary.slice(start), latin.slice(start)))
  return out
}
