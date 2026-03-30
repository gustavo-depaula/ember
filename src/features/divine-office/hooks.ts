import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAllReadingProgress,
  getReadingProgressByType,
  updateReadingProgress,
} from '@/db/repositories'
import { getCccParagraphs } from '@/lib/catechism'
import { getChapter, getDrbBooks } from '@/lib/content'

import type { PsalmRef } from './psalter'
import { getNextCccParagraph, getNextReading } from './utils'

type ReadingType = 'ot' | 'nt' | 'catechism'

export function useReadingProgress(type: ReadingType) {
  return useQuery({
    queryKey: ['readingProgress', type],
    queryFn: () => getReadingProgressByType(type),
  })
}

export function useAllReadingProgress() {
  return useQuery({
    queryKey: ['readingProgress'],
    queryFn: getAllReadingProgress,
  })
}

export function useAdvanceReading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, count = 1 }: { type: ReadingType; count?: number }) => {
      const current = await getReadingProgressByType(type)
      if (!current) return

      if (type === 'catechism') {
        let paragraph = current.current_chapter
        for (let i = 0; i < count; i++) {
          paragraph = getNextCccParagraph(paragraph)
        }
        await updateReadingProgress(type, { currentChapter: paragraph })
        return
      }

      const next = getNextReading(current.current_book, current.current_chapter, type)

      const completedBooks: string[] = JSON.parse(current.completed_books)
      const updates: Parameters<typeof updateReadingProgress>[1] = {
        currentBook: next.book,
        currentChapter: next.chapter,
        currentVerse: 1,
      }

      if (next.bookComplete && !completedBooks.includes(current.current_book)) {
        completedBooks.push(current.current_book)
        updates.completedBooks = JSON.stringify(completedBooks)

        // Sync: mark all chapters of the finished book in completed_chapters
        const bookData = getDrbBooks().find((b) => b.id === current.current_book)
        if (bookData) {
          const chapters: Record<string, number[]> = JSON.parse(current.completed_chapters)
          chapters[current.current_book] = Array.from(
            { length: bookData.chapters },
            (_, i) => i + 1,
          )
          updates.completedChapters = JSON.stringify(chapters)
        }
      }

      await updateReadingProgress(type, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
    },
  })
}

export function useMarkBooksRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, bookIds }: { type: 'ot' | 'nt'; bookIds: string[] }) => {
      const current = await getReadingProgressByType(type)
      if (!current) return

      const completedBooks: string[] = JSON.parse(current.completed_books)
      const merged = Array.from(new Set([...completedBooks, ...bookIds]))

      // Sync: mark all chapters of newly completed books
      const chapters: Record<string, number[]> = JSON.parse(current.completed_chapters)
      const books = getDrbBooks()
      for (const bookId of bookIds) {
        const bookData = books.find((b) => b.id === bookId)
        if (bookData) {
          chapters[bookId] = Array.from({ length: bookData.chapters }, (_, i) => i + 1)
        }
      }

      let currentBook = current.current_book
      let currentChapter = current.current_chapter

      if (bookIds.includes(currentBook)) {
        const next = getNextReading(currentBook, Number.MAX_SAFE_INTEGER, type)
        currentBook = next.book
        currentChapter = 1
      }

      await updateReadingProgress(type, {
        currentBook,
        currentChapter,
        completedBooks: JSON.stringify(merged),
        completedChapters: JSON.stringify(chapters),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
    },
  })
}

async function modifyCompletedChapters(
  type: 'ot' | 'nt',
  modifier: (chapters: Record<string, number[]>) => void,
) {
  const current = await getReadingProgressByType(type)
  if (!current) return

  const chapters: Record<string, number[]> = JSON.parse(current.completed_chapters)
  modifier(chapters)

  // Sync completedBooks: add books with all chapters marked, remove those without
  const books = getDrbBooks().filter((b) => b.testament === type)
  const completedBooks = new Set<string>(JSON.parse(current.completed_books))

  for (const book of books) {
    if ((chapters[book.id]?.length ?? 0) >= book.chapters) {
      completedBooks.add(book.id)
    } else {
      completedBooks.delete(book.id)
    }
  }

  const updates: Parameters<typeof updateReadingProgress>[1] = {
    completedChapters: JSON.stringify(chapters),
    completedBooks: JSON.stringify(Array.from(completedBooks)),
  }

  // If current book is now complete, advance to next unfinished book
  if (completedBooks.has(current.current_book)) {
    const bookIndex = books.findIndex((b) => b.id === current.current_book)
    for (let i = 1; i <= books.length; i++) {
      const next = books[(bookIndex + i) % books.length]
      if (!completedBooks.has(next.id)) {
        updates.currentBook = next.id
        updates.currentChapter = 1
        updates.currentVerse = 1
        break
      }
    }
  }

  await updateReadingProgress(type, updates)
}

export function useToggleChapterRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      type,
      bookId,
      chapter,
    }: {
      type: 'ot' | 'nt'
      bookId: string
      chapter: number
    }) =>
      modifyCompletedChapters(type, (chapters) => {
        const bookChapters = chapters[bookId] ?? []
        if (bookChapters.includes(chapter)) {
          chapters[bookId] = bookChapters.filter((c) => c !== chapter)
          if (chapters[bookId].length === 0) delete chapters[bookId]
        } else {
          chapters[bookId] = [...bookChapters, chapter].sort((a, b) => a - b)
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
    },
  })
}

export function useToggleBookRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      type,
      bookId,
      totalChapters,
    }: {
      type: 'ot' | 'nt'
      bookId: string
      totalChapters: number
    }) =>
      modifyCompletedChapters(type, (chapters) => {
        const bookChapters = chapters[bookId] ?? []
        if (bookChapters.length === totalChapters) {
          delete chapters[bookId]
        } else {
          chapters[bookId] = Array.from({ length: totalChapters }, (_, i) => i + 1)
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
    },
  })
}

export function useSetReadingPosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ type, book, chapter }: { type: string; book?: string; chapter: number }) =>
      updateReadingProgress(type, {
        currentBook: book,
        currentChapter: chapter,
        currentVerse: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
    },
  })
}

// --- Content-loading hooks ---

import type { PsalmData } from '@/components/PsalmodyBlock'

export type { PsalmData }

export function usePsalmsForHour(psalms: PsalmRef[], translation: string) {
  const results = useQueries({
    queries: psalms.map((ref) => ({
      queryKey: ['psalm', translation, ref.psalm, ref.verseRange ?? null],
      queryFn: async (): Promise<PsalmData> => {
        const result = await getChapter(translation, 'psalms', ref.psalm)
        let verses = result.verses
        if (ref.verseRange) {
          verses = verses.filter(
            (v) => v.verse >= ref.verseRange![0] && v.verse <= ref.verseRange![1],
          )
        }
        return { ref, verses }
      },
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const data = results.map((r) => r.data).filter((d): d is PsalmData => d !== undefined)

  return { data, isLoading }
}

export function useBibleReading(
  book: string | undefined,
  chapter: number | undefined,
  translation: string,
) {
  return useQuery({
    queryKey: ['chapter', translation, book, chapter],
    queryFn: () => getChapter(translation, book as string, chapter as number),
    enabled: !!book && !!chapter,
  })
}

export function useCccReading(start: number | undefined, count: number | undefined) {
  return useQuery({
    queryKey: ['ccc', start, count],
    queryFn: () => getCccParagraphs(start as number, count as number),
    enabled: !!start && !!count,
  })
}
