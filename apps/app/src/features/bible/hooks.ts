import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

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

/** Display name for a reader position, in the interface language. */
export function useBookName(translation: string, bookId: string) {
  const { t } = useTranslation()
  const { data: books } = useBooks(translation)
  const book = books?.find((b) => b.id === bookId)
  return t(`bookName.${bookId}`, { defaultValue: book?.name ?? bookId })
}

/** The places last read, each with its book's name and length, most recent first. */
export function useBiblePlaces() {
  const { t } = useTranslation()
  const translation = usePreferencesStore((s) => s.translation)
  const { places, hydrated } = useBibleStore(
    useShallow((s) => ({ places: s.places, hydrated: s.hydrated })),
  )
  const { data: books } = useBooks(translation)
  if (!hydrated) return []
  return places.map((place) => {
    const book = books?.find((b) => b.id === place.bookId)
    return {
      ...place,
      bookName: t(`bookName.${place.bookId}`, { defaultValue: book?.name ?? place.bookId }),
      chapters: book?.chapters,
    }
  })
}

/** Where to resume the Bible: the place read most recently, if there is one. */
export function useBibleResume() {
  return useBiblePlaces().at(0)
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
