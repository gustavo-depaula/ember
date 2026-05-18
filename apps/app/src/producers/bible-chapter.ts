import { type ChapterResult, getChapter } from '@/lib/content'
import type { DataProducer, ProducerContext } from './types'

function requireString(params: ProducerContext['params'], key: string): string {
  const v = params?.[key]
  if (typeof v !== 'string' || v.length === 0)
    throw new Error(`producer/bible-chapter: param "${key}" must be a non-empty string (got ${String(v)})`)
  return v
}

function requirePositiveInt(params: ProducerContext['params'], key: string): number {
  const raw = params?.[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1)
    throw new Error(`producer/bible-chapter: param "${key}" must be a positive integer (got ${String(raw)})`)
  return n
}

export const bibleChapterProducer: DataProducer<ChapterResult> = {
  id: 'producer/bible-chapter',
  kind: 'data',
  version: '1',
  cacheKey: (ctx) => {
    const translation = requireString(ctx.params, 'translation')
    const book = requireString(ctx.params, 'book')
    const chapter = requirePositiveInt(ctx.params, 'chapter')
    return `${translation}:${book}:${chapter}`
  },
  async produce(ctx) {
    const translation = requireString(ctx.params, 'translation')
    const book = requireString(ctx.params, 'book')
    const chapter = requirePositiveInt(ctx.params, 'chapter')
    return { data: await getChapter(translation, book, chapter) }
  },
}
