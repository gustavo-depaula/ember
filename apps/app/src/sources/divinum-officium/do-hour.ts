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
import { findOfficeChants } from '@/features/chant/propers'
import { type PsalmTone, pointPsalm, psalmOf, toneOf } from '@/features/chant/psalmody'
import type { ContentSource, SourceFetchContext } from '../types'
import { chantPrimitive, partNames, withChant } from './chant'
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
  version: '13',
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
    // What is sung in the hour — antiphons, the hymn, the short responsory — is
    // followed by its chant where the corpus has it, found by the text. An
    // antiphon is printed before its psalms and after them, in the little hours
    // items apart: its chant goes with the first.
    //
    // A psalm follows its antiphon's tone, which the antiphon's score names; in
    // the little hours one antiphon governs three psalms, so the tone carries
    // from item to item until another antiphon gives another.
    const latin = assembled.latin
    const found = await Promise.all(latin.map((item) => findOfficeChants(item.split('\n'))))
    const set = new Set<string>()
    let tone: PsalmTone | undefined
    const chants = latin.map((item, i): Primitive[] => {
      const out: Primitive[] = []
      for (const chant of found[i]) {
        if (chant.genre === 'an') tone = toneOf(chant.mode, chant.score)
        if (set.has(chant.id)) continue
        set.add(chant.id)
        out.push(chantPrimitive(chant, partNames[chant.genre]))
      }
      const psalm = psalmOf(item.split('\n'))
      if (psalm && tone) {
        out.push({
          type: 'chant',
          name: psalm.name,
          part: 'Psalmus',
          commentary: `Tonus ${tone.name}`,
          score: pointPsalm(tone, psalm.verses),
        })
      }
      return out
    })
    return withChant(assembled.vernacular ?? latin, latin, (_, i) => chants[i])
  },
}
