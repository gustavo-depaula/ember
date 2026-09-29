import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { type BollsLanguageEntry, fetchAllTranslations } from '@/lib/bolls'
import { type Book, getBooks, getChapter } from '@/lib/content'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { findAdjacentChapter } from './bookNav'

export function useBooks(translation: string) {
  return useQuery({
    queryKey: ['bible', 'books', translation],
    queryFn: () => getBooks(translation),
  })
}

/**
 * Display name for a reader position. Bolls translations key books by numeric
 * id ("28"), which the `bookName` table doesn't know — fall back to the
 * translation's own book list, and stay undefined until it's loaded rather
 * than surface the bare number.
 */
export function useBookName(translation: string, bookId: string) {
  const { t } = useTranslation()
  const { data: books } = useBooks(translation)
  const book = books?.find((b) => b.id === bookId)
  if (!book && !Number.isNaN(Number.parseInt(bookId, 10))) return undefined
  return t(`bookName.${bookId}`, { defaultValue: book?.name ?? bookId })
}

/**
 * Where to resume the Bible, or undefined while there's nothing to resume —
 * still loading, or parked at its Genesis-1 default.
 */
export function useBibleResume() {
  const translation = usePreferencesStore((s) => s.translation)
  const { bookId, chapter, updatedAt, hydrated } = useBibleStore(
    useShallow((s) => ({
      bookId: s.bookId,
      chapter: s.chapter,
      updatedAt: s.updatedAt,
      hydrated: s.hydrated,
    })),
  )
  const bookName = useBookName(translation, bookId)
  const { data: books } = useBooks(translation)
  if (!hydrated || !bookName || (bookId === 'genesis' && chapter === 1)) return undefined
  const chapters = books?.find((b) => b.id === bookId)?.chapters
  return { bookId, bookName, chapter, chapters, updatedAt }
}

export function useChapter(translation: string, bookId: string, chapter: number) {
  return useQuery({
    queryKey: ['chapter', translation, bookId, chapter],
    queryFn: () => getChapter(translation, bookId, chapter),
  })
}

export function usePrefetchAdjacentChapters(
  translation: string,
  bookId: string,
  chapter: number,
  books: Book[],
) {
  const queryClient = useQueryClient()
  const booksRef = useRef(books)
  booksRef.current = books

  useEffect(() => {
    if (booksRef.current.length === 0) return

    const next = findAdjacentChapter(bookId, chapter, booksRef.current, 'next')
    if (next) {
      queryClient.prefetchQuery({
        queryKey: ['chapter', translation, next.bookId, next.chapter],
        queryFn: () => getChapter(translation, next.bookId, next.chapter),
      })
    }

    const prev = findAdjacentChapter(bookId, chapter, booksRef.current, 'prev')
    if (prev) {
      queryClient.prefetchQuery({
        queryKey: ['chapter', translation, prev.bookId, prev.chapter],
        queryFn: () => getChapter(translation, prev.bookId, prev.chapter),
      })
    }
  }, [translation, bookId, chapter, queryClient])
}

export function useAllTranslations() {
  return useQuery<BollsLanguageEntry[]>({
    queryKey: ['bolls', 'translations'],
    queryFn: fetchAllTranslations,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
