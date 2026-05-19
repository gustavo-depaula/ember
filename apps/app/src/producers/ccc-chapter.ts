import type { VersesPrimitive } from '@/content/primitives'
import { getCccParagraphs } from '@/lib/catechism'
import { requirePositiveInt } from './params'
import type { ContentSource } from './types'

const ID = 'producer/ccc-chapter'

export const cccChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  version: '1',
  prefsDeps: ['lang'],
  fetch: async ({ params }): Promise<VersesPrimitive> => {
    const start = requirePositiveInt(ID, params, 'start')
    const count = requirePositiveInt(ID, params, 'count')
    const paragraphs = await getCccParagraphs(start, count)
    const endParagraph = start + count - 1
    return {
      type: 'verses',
      header: { primary: `CCC ${start}–${endParagraph}` },
      items: paragraphs.map((p) => ({ num: p.number, text: { primary: p.text } })),
      style: 'numbered',
    }
  },
}

export const cccChapterProducer = cccChapterSource
