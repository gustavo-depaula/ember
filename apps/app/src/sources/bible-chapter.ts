import type { VersesPrimitive } from '@/content/primitives'
import { type ChapterResult, getChapter } from '@/lib/content'
import { requirePositiveInt, requireString } from './params'
import type { ContentSource } from './types'

const ID = 'producer/bible-chapter'

// Returns the full chapter as numbered verses. The preprocessor's `reading`
// case overrides the header with a localized `${bookName} ${chapter}:vv`
// label and filters the items to the requested verse range — keeping this
// source's cache at chapter granularity (Gen 1:1-5 and Gen 1:5-10 share
// the same fetched row).
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
      items: result.verses.map((v) => ({ num: v.verse, text: { primary: v.text } })),
      style: 'numbered',
      fallback: result.fallback,
    }
  },
}
