import { getChapter, type Verse } from '@/lib/content'
import type { PsalmRef } from '@/lib/liturgical'
import { requireArray } from './params'
import type { DataProducer } from './types'

const ID = 'producer/psalmody'

export type PsalmodySlot = { ref: PsalmRef; verses: Verse[] }

function psalmsKey(refs: PsalmRef[] | undefined): string {
  if (!Array.isArray(refs)) return ''
  return refs
    .map((r) =>
      r?.verseRange ? `${r.psalm}:${r.verseRange[0]}-${r.verseRange[1]}` : String(r?.psalm),
    )
    .join(',')
}

export const psalmodyProducer: DataProducer<PsalmodySlot[]> = {
  id: ID,
  kind: 'data',
  version: '1',
  cacheKey: (ctx) =>
    `${ctx.prefs.translation}:${psalmsKey(ctx.params?.psalms as PsalmRef[] | undefined)}`,
  async produce(ctx) {
    const refs = requireArray<PsalmRef>(ID, ctx.params, 'psalms')
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
