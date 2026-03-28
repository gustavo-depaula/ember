import type { ReadingProgress } from '@/db/schema'
import { getDrbBooks } from '@/lib/content'

export type ReadingReference =
  | { type: 'bible'; book: string; bookName: string; chapter: number }
  | { type: 'catechism'; startParagraph: number; count: number }

export type OfficeReadingType = 'ot' | 'nt' | 'catechism'

export const cccDailyCount = 8

export const readingTypeForHour: Record<'morning' | 'evening' | 'compline', OfficeReadingType> = {
  morning: 'ot',
  evening: 'nt',
  compline: 'catechism',
}

export function getTodaysReading(
  type: OfficeReadingType,
  progress: ReadingProgress,
): ReadingReference {
  if (type === 'catechism') {
    return {
      type: 'catechism',
      startParagraph: progress.current_chapter,
      count: cccDailyCount,
    }
  }

  const books = getDrbBooks()
  const book = books.find((b) => b.id === progress.current_book)
  return {
    type: 'bible',
    book: progress.current_book,
    bookName: book?.name ?? progress.current_book,
    chapter: progress.current_chapter,
  }
}
