import type { VersesPrimitive } from '@/content/primitives'
import { type ChapterResult, getChapter } from '@/lib/content'
import i18n from '@/lib/i18n'
import { formatVerseRange } from '@/lib/lectio'
import { requirePositiveInt, requireString } from './params'
import type { ContentSource } from './types'

const ID = 'producer/bible-chapter'

function optionalPositiveInt(
  params: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const raw = params?.[key]
  if (raw === undefined || raw === null) return undefined
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  return Number.isInteger(n) && n >= 1 ? n : undefined
}

export const bibleChapterSource: ContentSource<VersesPrimitive> = {
  id: ID,
  version: '2',
  prefsDeps: ['translation'],
  fetch: async ({ params, prefs }): Promise<VersesPrimitive> => {
    const book = requireString(ID, params, 'book')
    const chapter = requirePositiveInt(ID, params, 'chapter')
    const startVerse = optionalPositiveInt(params, 'startVerse')
    const endVerse = optionalPositiveInt(params, 'endVerse')
    const toEnd = params?.toEnd === true
    const bookNameParam =
      typeof params?.bookName === 'string' ? (params.bookName as string) : undefined

    const result: ChapterResult = await getChapter(prefs.translation, book, chapter)
    const filtered =
      startVerse !== undefined
        ? result.verses.filter(
            (v) => v.verse >= startVerse && (endVerse === undefined || v.verse <= endVerse),
          )
        : result.verses

    const localizedBook = i18n.t(`bookName.${book}`, { defaultValue: bookNameParam ?? book })
    return {
      type: 'verses',
      header: {
        primary: `${localizedBook} ${chapter}${formatVerseRange(startVerse, endVerse, toEnd)}`,
      },
      items: filtered.map((v) => ({ num: v.verse, text: { primary: v.text } })),
      style: 'numbered',
      fallback: result.fallback,
    }
  },
}
