import type { Hour } from '@ember/loth'
import { getCatalog } from '@/content/contentIndex'
import type { Primitive } from '@/content/primitives'
import { corpusLoth } from '@/lib/loth/loaders'
import type { ContentSource, SourceFetchContext } from '../types'
import { type LatinSource, lothHour } from './hour'

// The practice's hour ids, which are also the ones its other source takes.
const hourOf: Record<string, Hour> = {
  'office-of-readings': 'readings',
  lauds: 'lauds',
  terce: 'terce',
  sext: 'sext',
  none: 'none',
  vespers: 'vespers',
  compline: 'compline',
}

/**
 * The Liturgy of the Hours of the day. The corpus holds the Brazilian
 * edition, so a reader in Brazilian Portuguese prays from it, offline; every
 * other language is handed to `elsewhere` (iBreviary in the app). A reader
 * who sets Latin beside it is given the editio typica part by part, from the
 * corpus too (`latin`). A reader of Brazil's calendar or of Brazilian
 * Portuguese who prays in Latin prays the Brazilian edition's office in its
 * Latin, a part without one in its Portuguese.
 */
export function lothHourSource(
  elsewhere: ContentSource<Primitive | Primitive[]>,
  latin?: LatinSource,
) {
  return {
    id: 'producer/loth-hour',
    // The corpus is the input: a rebuilt corpus is a new version.
    get version() {
      return `14:${getCatalog().generated}`
    },
    prefsDeps: [
      'lang' as const,
      'secondaryLang' as const,
      'jurisdiction' as const,
      'vernacular' as const,
    ],
    dateScoped: true,
    async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
      const id = String(ctx.params.hour)
      const hour = hourOf[id]
      if (!hour) throw new Error(`Liturgy of the Hours: unknown hour ${JSON.stringify(id)}`)
      const { lang, secondaryLang, jurisdiction, vernacular } = ctx.prefs
      if (lang === 'pt-BR')
        return lothHour(ctx.date, hour, corpusLoth, secondaryLang === 'la' ? latin : undefined)
      const brazilian = jurisdiction === 'BR' || vernacular === 'pt-BR'
      const inLatin = lang === 'la' || secondaryLang === 'la'
      if (brazilian && inLatin && latin)
        return inItsLatin(await lothHour(ctx.date, hour, corpusLoth, latin))
      return ctx.sources.fetch(elsewhere, { hour: id })
    },
  }
}

// The office in Latin alone: each text in the Latin set beside it, the
// Portuguese where it has none. A text with no companion side is left as it is
// (a rubric, a heading), so it reads in the Brazilian edition's own words.
function inItsLatin<T>(value: T): T {
  if (Array.isArray(value)) return value.map(inItsLatin) as T
  if (!value || typeof value !== 'object') return value
  const record = value as Record<string, unknown>
  if (typeof record.primary === 'string' && ('secondary' in record || 'secondaryMissing' in record))
    return {
      primary: typeof record.secondary === 'string' ? record.secondary : record.primary,
    } as T
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, inItsLatin(v)])) as T
}
