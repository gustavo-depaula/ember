import type { VersesPrimitive } from '@/content/primitives'
import { getCccParagraphs } from '@/lib/catechism'
import { requirePositiveInt } from './params'
import type { ContentSource } from './types'

const ID = 'producer/ccc-chapter'

// Returns CCC paragraphs as numbered verses. The preprocessor's `reading`
// case adds the localized "Catechism of the Catholic Church, N–M" header.
export const cccChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  version: '1',
  prefsDeps: ['lang'],
  fetch: async ({ params }): Promise<VersesPrimitive> => {
    const start = requirePositiveInt(ID, params, 'start')
    const count = requirePositiveInt(ID, params, 'count')
    const paragraphs = await getCccParagraphs(start, count)
    return {
      type: 'verses',
      items: paragraphs.map((p) => ({ num: p.number, text: { primary: p.text } })),
      style: 'numbered',
    }
  },
}
