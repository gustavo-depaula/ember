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
 * corpus too (`latin`).
 */
export function lothHourSource(
  elsewhere: ContentSource<Primitive | Primitive[]>,
  latin?: LatinSource,
) {
  return {
    id: 'producer/loth-hour',
    // The corpus is the input: a rebuilt corpus is a new version.
    get version() {
      return `13:${getCatalog().generated}`
    },
    prefsDeps: ['lang' as const, 'secondaryLang' as const],
    dateScoped: true,
    async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
      const id = String(ctx.params.hour)
      const hour = hourOf[id]
      if (!hour) throw new Error(`Liturgy of the Hours: unknown hour ${JSON.stringify(id)}`)
      if (ctx.prefs.lang !== 'pt-BR') return ctx.sources.fetch(elsewhere, { hour: id })
      const beside = ctx.prefs.secondaryLang === 'la' ? latin : undefined
      return lothHour(ctx.date, hour, corpusLoth, beside)
    },
  }
}
