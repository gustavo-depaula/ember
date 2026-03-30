import { addDays, differenceInCalendarDays } from 'date-fns'

import { getDrbBooks } from '@/lib/content'

type ProgressRow = {
  type: string
  currentBook: string
  currentChapter: number
  completedBooks: string
  completedChapters?: string
  startDate: string
}

const cccTotalParagraphs = 2865

// Total chapters per testament from bundled DRB index
function getTestamentChapterCount(testament: 'ot' | 'nt'): number {
  return getDrbBooks()
    .filter((b) => b.testament === testament)
    .reduce((sum, b) => sum + b.chapters, 0)
}

function getCompletedChapterCount(progress: ProgressRow, testament: 'ot' | 'nt'): number {
  const books = getDrbBooks().filter((b) => b.testament === testament)
  const completedBooks: string[] = JSON.parse(progress.completedBooks)
  const manualChapters: Record<string, number[]> = progress.completedChapters
    ? JSON.parse(progress.completedChapters)
    : {}

  let count = 0
  for (const book of books) {
    if (completedBooks.includes(book.id)) {
      count += book.chapters
    } else if (book.id === progress.currentBook) {
      // Count whichever is greater: sequential position or manually marked chapters
      const manual = manualChapters[book.id]?.length ?? 0
      count += Math.max(progress.currentChapter - 1, manual)
      break
    } else {
      // Books before current: count manually marked chapters
      count += manualChapters[book.id]?.length ?? 0
    }
  }
  return count
}

export function getProgressPercentage(progress: ProgressRow): number {
  if (progress.type === 'catechism') {
    return (progress.currentChapter - 1) / cccTotalParagraphs
  }

  const testament = progress.type as 'ot' | 'nt'
  const total = getTestamentChapterCount(testament)
  if (total === 0) return 0
  const completed = getCompletedChapterCount(progress, testament)
  return completed / total
}

export function getEstimatedCompletion(progress: ProgressRow): Date {
  const start = new Date(progress.startDate)
  const now = new Date()
  const daysSoFar = differenceInCalendarDays(now, start) || 1
  const pct = getProgressPercentage(progress)

  if (pct === 0) return addDays(now, 365)
  const totalDaysEstimate = daysSoFar / pct
  const remaining = totalDaysEstimate - daysSoFar
  return addDays(now, Math.ceil(remaining))
}

export function getNextReading(
  currentBook: string,
  currentChapter: number,
  testament: 'ot' | 'nt',
): { book: string; chapter: number; bookComplete: boolean } {
  const books = getDrbBooks().filter((b) => b.testament === testament)
  const bookIndex = books.findIndex((b) => b.id === currentBook)

  if (bookIndex === -1) {
    return { book: currentBook, chapter: currentChapter, bookComplete: false }
  }

  const currentBookData = books[bookIndex]

  // More chapters in the current book
  if (currentChapter < currentBookData.chapters) {
    return {
      book: currentBook,
      chapter: currentChapter + 1,
      bookComplete: false,
    }
  }

  // Current book is complete, move to next
  const nextIndex = bookIndex + 1
  if (nextIndex < books.length) {
    return {
      book: books[nextIndex].id,
      chapter: 1,
      bookComplete: true,
    }
  }

  // Reached end of testament — wrap to start
  return {
    book: books[0].id,
    chapter: 1,
    bookComplete: true,
  }
}

export function getNextCccParagraph(current: number): number {
  if (current >= cccTotalParagraphs) return 1
  return current + 1
}
