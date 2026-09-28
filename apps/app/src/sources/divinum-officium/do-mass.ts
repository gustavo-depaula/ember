// producer/do-mass — the Extraordinary Form Mass, fully assembled by the
// Divinum Officium engine (kalendar + Ordo + propers + commemorations) and
// mapped onto primitives. The user's content language is the primary text;
// Latin rides as the secondary. Always the 1962 missal, the one the EF
// calendar follows too.

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
    const mass = await assembleMass({
      loader: createCorpusDoLoader(),
      day: ctx.date.getDate(),
      month: ctx.date.getMonth() + 1,
      year: ctx.date.getFullYear(),
      version: efVersion,
      lang2: doLangDir(ctx.prefs.lang),
    })
    return mapItemsToPrimitives(mass.vernacular ?? mass.latin, mass.latin)
  },
}
