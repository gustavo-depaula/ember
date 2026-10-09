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
import type { ContentSource, SourceFetchContext } from '../types'
import { mapItemsToPrimitives } from './blocks'
import { createCorpusDoLoader } from './loader'

export const doMassSource: ContentSource<Primitive[]> = {
  id: 'producer/do-mass',
  version: '11',
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
    if (!parts) return mapItemsToPrimitives(mass.vernacular ?? mass.latin, mass.latin)
    // The columns pair by position and only the Latin heads are the same in
    // every language, so the Latin column says which items to keep in both.
    const wanted = mass.latin.map((item) =>
      parts.includes(/^(?:#|!!)\s*(.*)/.exec(item)?.[1].trim() ?? ''),
    )
    const pick = (items: string[]) => items.filter((_, i) => wanted[i])
    return mapItemsToPrimitives(pick(mass.vernacular ?? mass.latin), pick(mass.latin))
  },
}
