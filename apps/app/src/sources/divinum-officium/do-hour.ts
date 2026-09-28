// producer/do-hour — one hour of the Divine Office, fully assembled by the
// Divinum Officium engine (kalendar + Ordinarium script + Psalterium) and
// mapped onto primitives. The user's content language is the primary text;
// Latin rides as the secondary. Params: { hour: 'Prima' | 'Tertia' | 'Sexta' |
// 'Nona' | 'Completorium' | 'Matutinum' | 'Laudes' | 'Vespera', version:
// DoVersionId, votive?: string }. Each breviary form names its rubric version
// and votive in its manifest `vars`. `votive` is a DO Commune code (e.g. 'C9'
// Office of the Dead, 'C12' Little Office BVM, 'V4' St Joseph); 'Hodie' is
// today's office.

import { assembleHour, doLangDir, officeVersion } from '@ember/divinum-officium'
import type { Primitive } from '@/content/primitives'
import type { ContentSource, SourceFetchContext } from '../types'
import { mapItemsToPrimitives } from './blocks'
import { createCorpusDoLoader } from './loader'

const hours = [
  'Matutinum',
  'Laudes',
  'Prima',
  'Tertia',
  'Sexta',
  'Nona',
  'Vespera',
  'Completorium',
] as const

type Hour = (typeof hours)[number]

export const doHourSource: ContentSource<Primitive[]> = {
  id: 'producer/do-hour',
  version: '11',
  prefsDeps: ['lang'],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[]> {
    const hour = ctx.params?.hour
    if (typeof hour !== 'string' || !hours.includes(hour as Hour)) {
      throw new Error(`producer/do-hour: unknown hour param '${String(hour)}'`)
    }
    const version = officeVersion(String(ctx.params?.version))
    const votive = typeof ctx.params?.votive === 'string' ? ctx.params.votive : 'Hodie'
    const assembled = await assembleHour({
      loader: createCorpusDoLoader(),
      day: ctx.date.getDate(),
      month: ctx.date.getMonth() + 1,
      year: ctx.date.getFullYear(),
      version,
      hora: hour as Hour,
      lang2: doLangDir(ctx.prefs.lang),
      votive,
    })
    return mapItemsToPrimitives(assembled.vernacular ?? assembled.latin, assembled.latin)
  },
}
