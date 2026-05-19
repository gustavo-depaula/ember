import type { VersesPrimitive } from '@/content/primitives'
import { type ChapterResult, getChapter } from '@/lib/content'
import { requirePositiveInt, requireString } from './params'
import type { ContentSource } from './types'

const ID = 'producer/bible-chapter'

export const bibleChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  version: '1',
  prefsDeps: ['translation'],
  fetch: async ({ params, prefs }): Promise<VersesPrimitive> => {
    const book = requireString(ID, params, 'book')
    const chapter = requirePositiveInt(ID, params, 'chapter')
    const result: ChapterResult = await getChapter(prefs.translation, book, chapter)
    return {
      type: 'verses',
      header: { primary: `${book} ${chapter}` },
      items: result.verses.map((v) => ({ num: v.verse, text: { primary: v.text } })),
      style: 'numbered',
      fallback: result.fallback,
    }
  },
}

// Legacy alias for code mid-migration.
export const bibleChapterProducer = bibleChapterSource
