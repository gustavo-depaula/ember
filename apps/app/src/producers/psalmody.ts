import { getChapter, type Verse } from '@/lib/content'
import type { PsalmRef } from '@/lib/liturgical'
import type { DataProducer, ProducerContext } from './types'

export type PsalmodySlot = { ref: PsalmRef; verses: Verse[] }

function requirePsalmRefs(params: ProducerContext['params']): PsalmRef[] {
  const raw = params?.psalms
  if (!Array.isArray(raw) || raw.length === 0)
    throw new Error('producer/psalmody: param "psalms" must be a non-empty array')
  return raw as PsalmRef[]
}

// Encodes the psalm list deterministically (psalm number + optional verse
// range) so the cache key collapses equivalent slot lists regardless of
// object identity.
function psalmsKey(refs: PsalmRef[]): string {
  return refs
    .map((r) => (r.verseRange ? `${r.psalm}:${r.verseRange[0]}-${r.verseRange[1]}` : String(r.psalm)))
    .join(',')
}

export const psalmodyProducer: DataProducer<PsalmodySlot[]> = {
  id: 'producer/psalmody',
  kind: 'data',
  version: '1',
  cacheKey: (ctx) => {
    const refs = requirePsalmRefs(ctx.params)
    return `${ctx.prefs.translation}:${psalmsKey(refs)}`
  },
  async produce(ctx) {
    const refs = requirePsalmRefs(ctx.params)
    const slots = await Promise.all(
      refs.map(async (ref): Promise<PsalmodySlot> => {
        const result = await getChapter(ctx.prefs.translation, 'psalms', ref.psalm)
        const verses = ref.verseRange
          ? result.verses.filter(
              (v) => v.verse >= ref.verseRange[0] && v.verse <= ref.verseRange[1],
            )
          : result.verses
        return { ref, verses }
      }),
    )
    return { data: slots }
  },
}
