import type { Hour } from '@ember/loth'
import { getCatalog } from '@/content/contentIndex'
import type { Primitive } from '@/content/primitives'
import { corpusLoth } from '@/lib/loth/loaders'
import type { ContentSource, SourceFetchContext } from '../types'
import { lothHour } from './hour'

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
 * other language is handed to `elsewhere` (iBreviary in the app).
 */
export function lothHourSource(elsewhere: ContentSource<Primitive | Primitive[]>) {
  return {
    id: 'producer/loth-hour',
    // The corpus is the input: a rebuilt corpus is a new version.
    get version() {
      return `5:${getCatalog().generated}`
    },
    prefsDeps: ['lang' as const],
    dateScoped: true,
    async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
      const id = String(ctx.params.hour)
      const hour = hourOf[id]
      if (!hour) throw new Error(`Liturgy of the Hours: unknown hour ${JSON.stringify(id)}`)
      if (ctx.prefs.lang !== 'pt-BR') return ctx.sources.fetch(elsewhere, { hour: id })
      return lothHour(ctx.date, hour, corpusLoth)
    },
  }
}
