import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { type Book, getBooks, getChapter } from '@/lib/content'

import { findAdjacentChapter } from './bookNav'

export function useBooks(translation: string) {
  return useQuery({
    queryKey: ['bible', 'books', translation],
    queryFn: () => getBooks(translation),
  })
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
