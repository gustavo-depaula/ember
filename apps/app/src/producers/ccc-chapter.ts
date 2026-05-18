import { type CccParagraph, getCccParagraphs } from '@/lib/catechism'
import { requirePositiveInt } from './params'
import type { DataProducer } from './types'

const ID = 'producer/ccc-chapter'

export const cccChapterProducer: DataProducer<CccParagraph[]> = {
  id: ID,
  kind: 'data',
  version: '1',
  cacheKey: (ctx) => `${String(ctx.params?.start)}-${String(ctx.params?.count)}`,
  async produce(ctx) {
    const start = requirePositiveInt(ID, ctx.params, 'start')
    const count = requirePositiveInt(ID, ctx.params, 'count')
    return { data: await getCccParagraphs(start, count) }
  },
}
