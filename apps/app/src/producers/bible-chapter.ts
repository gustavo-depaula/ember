import { type ChapterResult, getChapter } from '@/lib/content'
import { requirePositiveInt, requireString } from './params'
import type { DataProducer } from './types'

const ID = 'producer/bible-chapter'

export const bibleChapterProducer: DataProducer<ChapterResult> = {
  id: ID,
  kind: 'data',
  version: '1',
  cacheKey: (ctx) =>
    `${ctx.prefs.translation}:${String(ctx.params?.book)}:${String(ctx.params?.chapter)}`,
  async produce(ctx) {
    const book = requireString(ID, ctx.params, 'book')
    const chapter = requirePositiveInt(ID, ctx.params, 'chapter')
    return { data: await getChapter(ctx.prefs.translation, book, chapter) }
  },
}
