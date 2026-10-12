// producer/do-mass — the Extraordinary Form Mass, fully assembled by the
// Divinum Officium engine (kalendar + Ordo + propers + commemorations) and
// mapped onto primitives. The user's content language is the primary text;
// Latin rides as the secondary. Always the 1962 missal, the one the EF
// calendar follows too.
//
// `parts` asks for some of the day's propers alone, by their Latin heads
// (['Oratio', 'Evangelium']), for a practice that prays from the day's Mass
// without being the Mass.

import { assembleMass, doLangDir, efVersion } from '@ember/divinum-officium'
import type { Primitive } from '@/content/primitives'
import type { Chant } from '@/features/chant/chants'
import { ordinaryChants } from '@/features/chant/ordinary'
import { findMassChants } from '@/features/chant/propers'
import type { ContentSource, SourceFetchContext } from '../types'
import { mapItemsToPrimitives } from './blocks'
import { createCorpusDoLoader } from './loader'

export const doMassSource: ContentSource<Primitive[]> = {
  id: 'producer/do-mass',
  version: '13',
  prefsDeps: ['lang'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const parts = ctx.params.parts as string[] | undefined
    const mass = await assembleMass({
      loader: createCorpusDoLoader(),
      day: ctx.date.getDate(),
      month: ctx.date.getMonth() + 1,
      year: ctx.date.getFullYear(),
      version: efVersion,
      lang2: doLangDir(ctx.prefs.lang),
      propers: parts !== undefined,
    })
    if (!parts) {
      const { winner, rank, dayname, dayofweek, commune } = mass.day
      const ordinary = await ordinaryChants({
        winner,
        rank,
        week: dayname[0],
        weekday: dayofweek,
        commune,
      })
      return withChant(mass.vernacular ?? mass.latin, mass.latin, ordinary)
    }
    // The columns pair by position and only the Latin heads are the same in
    // every language, so the Latin column says which items to keep in both.
    const wanted = mass.latin.map((item) =>
      parts.includes(/^(?:#|!!)\s*(.*)/.exec(item)?.[1].trim() ?? ''),
    )
    const pick = (items: string[]) => items.filter((_, i) => wanted[i])
    return mapItemsToPrimitives(pick(mass.vernacular ?? mass.latin), pick(mass.latin))
  },
}

const head = /^(?:#|!!)\s*(.*)/

/**
 * The Mass as primitives, each sung part followed by its chant where the corpus
 * has it: a proper's, found by its text, and the ordinary's, which the day's
 * rank chooses from the Kyriale. Items are mapped in runs that end at such a
 * part; a run starts on an item's head, which is where the mapper starts afresh
 * anyway.
 */
async function withChant(
  primary: string[],
  latin: string[],
  ordinary: Record<string, Chant>,
): Promise<Primitive[]> {
  const chants = await Promise.all(
    latin.map(async (item): Promise<Primitive[]> => {
      const [first, ...lines] = item.split('\n')
      const name = head.exec(first)?.[1].trim()
      if (!name) return []
      if (ordinary[name]) return [chantPrimitive(ordinary[name])]
      const propers = await findMassChants(name, lines)
      return propers.map((chant) => chantPrimitive(chant, partNames[chant.genre]))
    }),
  )
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

function chantPrimitive(chant: Chant, part?: string): Primitive {
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

const partNames = {
  in: 'Introitus',
  gr: 'Graduale',
  al: 'Alleluia',
  tr: 'Tractus',
  of: 'Offertorium',
  co: 'Communio',
  se: 'Sequentia',
}
