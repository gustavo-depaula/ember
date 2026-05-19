import type { Primitive, VersesPrimitive } from '@/content/primitives'
import { getChapter } from '@/lib/content'
import { formatPsalmRef, type PsalmRef } from '@/lib/liturgical'
import { requireArray } from './params'
import type { ContentSource } from './types'

const ID = 'producer/psalmody'

// One verses primitive per psalm — the preprocessor splices the array into
// the parent's children, so authors get a flat run of psalm sections.
export const psalmodySource: ContentSource<Primitive[]> = {
  id: ID,
  version: '1',
  prefsDeps: ['translation'],
  fetch: async ({ params, prefs }): Promise<Primitive[]> => {
    const refs = requireArray<PsalmRef>(ID, params, 'psalms')
    return Promise.all(
      refs.map(async (ref): Promise<VersesPrimitive> => {
        const result = await getChapter(prefs.translation, 'psalms', ref.psalm)
        const verses = ref.verseRange
          ? result.verses.filter(
              (v) => v.verse >= ref.verseRange[0] && v.verse <= ref.verseRange[1],
            )
          : result.verses
        return {
          type: 'verses',
          header: { primary: formatPsalmRef(ref) },
          items: verses.map((v) => ({ num: v.verse, text: { primary: v.text } })),
          style: 'numbered',
        }
      }),
    )
  },
}

