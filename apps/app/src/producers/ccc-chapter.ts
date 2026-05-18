import { type CccParagraph, getCccParagraphs } from '@/lib/catechism'
import type { DataProducer, ProducerContext } from './types'

function requirePositiveInt(params: ProducerContext['params'], key: string): number {
  const raw = params?.[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1)
    throw new Error(`producer/ccc-chapter: param "${key}" must be a positive integer (got ${String(raw)})`)
  return n
}

export const cccChapterProducer: DataProducer<CccParagraph[]> = {
  id: 'producer/ccc-chapter',
  kind: 'data',
  version: '1',
  cacheKey: (ctx) => {
    const start = requirePositiveInt(ctx.params, 'start')
    const count = requirePositiveInt(ctx.params, 'count')
    return `${start}-${count}`
  },
  async produce(ctx) {
    const start = requirePositiveInt(ctx.params, 'start')
    const count = requirePositiveInt(ctx.params, 'count')
    return { data: await getCccParagraphs(start, count) }
  },
}
