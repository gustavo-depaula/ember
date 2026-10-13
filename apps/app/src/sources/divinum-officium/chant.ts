// Setting the chant of a Divinum Officium text beside it: shared by the Mass
// and the hours, which both arrive as items of Latin and are both searched for
// what in them is sung.

import type { ChantPrimitive, Primitive } from '@/content/primitives'
import type { Chant } from '@/features/chant/chants'
import { sungSpan } from '@/features/chant/sungSpan'
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

export function chantPrimitive(chant: Chant, part?: string): ChantPrimitive {
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
 * The items as primitives, what is sung in an item made one block with its
 * chants: the part of it their scores cover, the rest left as it reads. An item
 * is mapped on its own there, which loses nothing: it opens on its heading,
 * where the mapper starts afresh anyway.
 */
export async function withChant(
  primary: string[],
  latin: string[],
  chantsOf: (latinItem: string, index: number) => Promise<ChantPrimitive[]> | ChantPrimitive[],
): Promise<Primitive[]> {
  const chants = await Promise.all(latin.map(chantsOf))
  const out: Primitive[] = []
  let start = 0
  chants.forEach((found, i) => {
    if (!found.length) return
    out.push(...mapItemsToPrimitives(primary.slice(start, i), latin.slice(start, i)))
    const { before, text, after } = sungSpan(mapItemsToPrimitives([primary[i]], [latin[i]]), found)
    out.push(...before, { type: 'sung', text, chants: found }, ...after)
    start = i + 1
  })
  out.push(...mapItemsToPrimitives(primary.slice(start), latin.slice(start)))
  return out
}
