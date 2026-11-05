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

// Hours made while the Latin could not be fetched: shown, not kept.
const withoutTheirLatin = new WeakSet<object>()

/**
 * The Liturgy of the Hours of the day. The corpus holds the Brazilian
 * edition, so a reader in Brazilian Portuguese prays from it, offline; every
 * other language is handed to `elsewhere` (iBreviary in the app). A reader
 * who sets Latin beside it is given `latin`'s (iBreviary's editio typica)
 * part by part, which needs the network; the Portuguese does not wait on it.
 */
export function lothHourSource(
  elsewhere: ContentSource<Primitive | Primitive[]>,
  latin?: ContentSource<Primitive | Primitive[]>,
) {
  return {
    id: 'producer/loth-hour',
    // The corpus is the input: a rebuilt corpus is a new version.
    get version() {
      return `12:${getCatalog().generated}`
    },
    prefsDeps: ['lang' as const, 'secondaryLang' as const],
    dateScoped: true,
    keep: (payload: Primitive | Primitive[]) => !withoutTheirLatin.has(payload),
    async fetch(ctx: SourceFetchContext): Promise<Primitive | Primitive[]> {
      const id = String(ctx.params.hour)
      const hour = hourOf[id]
      if (!hour) throw new Error(`Liturgy of the Hours: unknown hour ${JSON.stringify(id)}`)
      if (ctx.prefs.lang !== 'pt-BR') return ctx.sources.fetch(elsewhere, { hour: id })
      if (!latin || ctx.prefs.secondaryLang !== 'la') return lothHour(ctx.date, hour, corpusLoth)
      const fetched = await ctx.sources.fetch(latin, { hour: id }).then(
        (out) => ({ out: [out].flat() }),
        (error: unknown) => ({ error }),
      )
      if ('out' in fetched) return lothHour(ctx.date, hour, corpusLoth, fetched.out)
      const reason = fetched.error instanceof Error ? fetched.error.message : String(fetched.error)
      const prayed: Primitive[] = [
        {
          type: 'rubric',
          text: {
            primary: `O texto latino não pôde ser carregado (${reason}).`,
          },
        },
        ...(await lothHour(ctx.date, hour, corpusLoth)),
      ]
      withoutTheirLatin.add(prayed)
      return prayed
    },
  }
}
