import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { BookEntry } from '@/content/manifestTypes'
import { chapterImageUrls } from './chapterImageUrls'
import { loadChapterHtml } from './loadChapterHtml'
import type { ChapterWindow } from './protocol'

export type TocLeaf = { id: string }

/**
 * Pure: resolve the {prev, cur, next} chapter ids around a current chapter.
 * Extracted so it can be tested without React or TanStack.
 */
export function bufferWindowIds(
  leaves: ReadonlyArray<TocLeaf>,
  currentChapterId: string | undefined,
): { prevId?: string; curId?: string; nextId?: string } {
  if (!currentChapterId) return {}
  const idx = leaves.findIndex((l) => l.id === currentChapterId)
  if (idx < 0) return { curId: currentChapterId }
  return {
    prevId: idx > 0 ? leaves[idx - 1].id : undefined,
    curId: currentChapterId,
    nextId: idx < leaves.length - 1 ? leaves[idx + 1].id : undefined,
  }
}

type Args = {
  bookId: string | undefined
  book: BookEntry | undefined
  lang: string
  leaves: ReadonlyArray<TocLeaf>
  currentChapterId: string | undefined
  titleLookup: Map<string, string>
}

/**
 * Fetch a rolling window of {prev, cur, next} chapter HTML for the reader
 * surface. Each chapter is its own query keyed by [bookId, lang, chapterId]
 * with `staleTime: Infinity`, so adjacent chapters stay resident across nav.
 *
 * Returns `window: undefined` while the current chapter is still loading.
 * The returned object is memoised so the DOM bridge doesn't re-serialise
 * unchanged HTML on unrelated re-renders.
 */
export function useReaderBuffer({
  bookId,
  book,
  lang,
  leaves,
  currentChapterId,
  titleLookup,
}: Args): { window: ChapterWindow | undefined; isLoading: boolean } {
  const ids = useMemo(() => bufferWindowIds(leaves, currentChapterId), [leaves, currentChapterId])

  const imageUrls = useMemo(
    () => (book ? chapterImageUrls(book) : new Map<string, string>()),
    [book],
  )

  const idList = useMemo(
    () => [ids.prevId, ids.curId, ids.nextId].filter((v): v is string => typeof v === 'string'),
    [ids.prevId, ids.curId, ids.nextId],
  )

  const results = useQueries({
    queries: idList.map((id) => ({
      queryKey: ['book-chapter', bookId, lang, id],
      queryFn: () => {
        if (!book) throw new Error('book manifest not loaded')
        return loadChapterHtml(book, id, lang, imageUrls, titleLookup.get(id))
      },
      enabled: !!book && !!bookId,
      staleTime: Number.POSITIVE_INFINITY,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)

  const htmlById = new Map<string, string>()
  for (let i = 0; i < idList.length; i++) {
    const html = results[i].data?.html
    if (html !== undefined) htmlById.set(idList[i], html)
  }

  const curHtml = ids.curId ? htmlById.get(ids.curId) : undefined
  const prevHtml = ids.prevId ? htmlById.get(ids.prevId) : undefined
  const nextHtml = ids.nextId ? htmlById.get(ids.nextId) : undefined

  const window = useMemo<ChapterWindow | undefined>(() => {
    if (!ids.curId || curHtml === undefined) return undefined
    return {
      curChapterId: ids.curId,
      curHtml,
      prevChapterId: ids.prevId,
      prevHtml,
      nextChapterId: ids.nextId,
      nextHtml,
    }
  }, [ids.curId, ids.prevId, ids.nextId, curHtml, prevHtml, nextHtml])

  return { window, isLoading }
}
