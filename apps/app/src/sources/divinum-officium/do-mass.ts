// producer/do-mass — the Extraordinary Form Mass, fully assembled by the
// Divinum Officium engine (kalendar + Ordo + propers + commemorations) and
// mapped onto primitives. The user's content language is the primary text;
// Latin rides as the secondary. The rubric version follows the doVersion
// preference (Monastic maps to the 1962 missal — there is no Monastic Mass).

import { assembleMass, doLangDir, massVersion } from '@ember/divinum-officium'
import type { Primitive } from '@/content/primitives'
import type { ContentSource, SourceFetchContext } from '../types'
import { mapItemsToPrimitives } from './blocks'
import { createCorpusDoLoader } from './loader'

export const doMassSource: ContentSource<Primitive[]> = {
  id: 'producer/do-mass',
  version: '1',
  prefsDeps: ['lang', 'doVersion'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const mass = await assembleMass({
      loader: createCorpusDoLoader(),
      day: ctx.date.getDate(),
      month: ctx.date.getMonth() + 1,
      year: ctx.date.getFullYear(),
      version: massVersion(ctx.prefs.doVersion),
      lang2: doLangDir(ctx.prefs.lang),
    })
    // Vernacular column is the user's primary; Latin is the secondary.
    return mapItemsToPrimitives(mass.vernacular ?? mass.latin, mass.latin)
  },
}
