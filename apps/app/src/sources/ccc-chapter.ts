import type { VersesPrimitive } from '@/content/primitives'
import { getCccParagraphs } from '@/lib/catechism'
import i18n from '@/lib/i18n'
import { requirePositiveInt } from './params'
import type { ContentSource } from './types'

const ID = 'producer/ccc-chapter'

export const cccChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  version: '2',
  prefsDeps: ['lang'],
  fetch: async ({ params }): Promise<VersesPrimitive> => {
    const start = requirePositiveInt(ID, params, 'start')
    const count = requirePositiveInt(ID, params, 'count')
    const end = start + count - 1
    const paragraphs = await getCccParagraphs(start, count)
    return {
      type: 'verses',
      header: { primary: i18n.t('office.cccLabel', { start, end }) },
      items: paragraphs.map((p) => ({ num: p.number, text: { primary: p.text } })),
      style: 'numbered',
    }
  },
}
