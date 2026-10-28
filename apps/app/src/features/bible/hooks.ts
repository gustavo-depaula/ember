import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { translations } from '@/lib/bibleTranslations'
import { type Book, getBooks, getChapter } from '@/lib/content'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { findAdjacentChapter } from './bookNav'
import { citationsForVerse, getChapterCitations, splitByVerse } from './citations'
import {
  type CommentaryEntry,
  entriesForVerse,
  getCommentary,
  getLectures,
  loadVoices,
  sourcesForBook,
} from './commentary'
import {
  getChapterReadings,
  getSummaArticles,
  getTalks,
  type ReferenceKind,
  readingsForVerse,
  referenceKinds,
} from './references'

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

/**
 * What every commentator on this book says of the chapter, keyed by source.
 * All of them at once: a verse one is silent on names those that speak of it.
 */
export function useChapterCommentary(bookId: string, chapter: number, enabled: boolean) {
  const sources = sourcesForBook(bookId)
  return useQueries({
    queries: sources.map((source) => ({
      queryKey: ['bible', 'commentary', source.id, bookId, chapter],
      queryFn: () => getCommentary(source.id, bookId, chapter),
      enabled,
      staleTime: Number.POSITIVE_INFINITY,
    })),
    combine: (results) => ({
      sources,
      bySource: Object.fromEntries(sources.map((s, i) => [s.id, results[i].data])),
      isLoading: results.some((r) => r.isLoading),
      error: results.find((r) => r.error)?.error,
    }),
  })
}

/**
 * The words of each entry, in the entries' order. Haydock's come with the
 * entry; a Catena lecture is read from its book, one at a time and only when
 * a verse it speaks of is opened.
 */
export function useEntryVoices(entries: CommentaryEntry[]) {
  return useQueries({
    queries: entries.map((entry) => ({
      queryKey: entry.lecture
        ? ['bible', 'lecture', entry.lecture.bookId, entry.lecture.chapterId]
        : ['bible', 'voices', entry.from, entry.to, entry.voices?.[0]?.text],
      queryFn: () => loadVoices(entry),
      staleTime: Number.POSITIVE_INFINITY,
    })),
    combine: (results) => ({
      byEntry: results.map((r) => r.data ?? []),
      isLoading: results.some((r) => r.isLoading),
      error: results.find((r) => r.error)?.error,
    }),
  })
}

/**
 * What points at a verse from elsewhere, a kind at a time, and how many of
 * each: the half page puts the counts on its line of kinds, so all of it is
 * read as soon as a verse is opened.
 */
function useVerseReferences(bookId: string, chapter: number, verse: number, enabled: boolean) {
  const staleTime = Number.POSITIVE_INFINITY
  const passages = useQuery({
    queryKey: ['bible', 'citations', bookId, chapter],
    queryFn: () => getChapterCitations(bookId, chapter),
    staleTime,
    enabled,
  })
  const lectures = useQuery({
    queryKey: ['bible', 'lectures', bookId, chapter],
    queryFn: () => getLectures(bookId, chapter),
    staleTime,
    enabled,
  })
  const articles = useQuery({
    queryKey: ['bible', 'summa', bookId, chapter, verse],
    queryFn: () => getSummaArticles(bookId, chapter, verse),
    staleTime,
    enabled,
  })
  const talks = useQuery({
    queryKey: ['bible', 'talks', bookId, chapter, verse],
    queryFn: () => getTalks(bookId, chapter, verse),
    staleTime,
    enabled,
  })
  const readings = useQuery({
    queryKey: ['bible', 'lectionary', bookId, chapter],
    queryFn: () => getChapterReadings(bookId, chapter),
    staleTime,
    enabled,
  })

  const cited = citationsForVerse(passages.data ?? [], verse)
  const split = cited ? splitByVerse(cited, verse) : undefined
  const catechism = split?.ccc ?? { here: [], elsewhere: [] }
  const councils = split?.magisterium ?? { here: [], elsewhere: [] }
  const found = {
    catechism,
    councils,
    homilies: cited?.homilies ?? [],
    lectures: entriesForVerse(lectures.data ?? [], verse),
    articles: articles.data ?? [],
    talks: talks.data ?? [],
    readings: readingsForVerse(readings.data ?? [], verse),
  }
  const sections = (documents: typeof councils.here) =>
    documents.reduce((n, document) => n + document.places.length, 0)
  // What cites the verse itself is what is counted; where nothing does, what
  // cites the passage around it is what the reader will be shown.
  const counts: Record<ReferenceKind, number> = {
    // The verse in the other editions is there for every verse.
    translations: translations.length,
    catechism: catechism.here.length || catechism.elsewhere.length,
    summa: found.articles.length + found.lectures.length,
    homilies: found.homilies.length,
    councils: sections(councils.here) || sections(councils.elsewhere),
    popes: found.talks.length,
    mass: found.readings.length,
  }
  const state = (...queries: { isLoading: boolean; error: Error | null }[]) => ({
    isLoading: queries.some((q) => q.isLoading),
    error: queries.find((q) => q.error)?.error ?? undefined,
  })
  const status: Record<ReferenceKind, { isLoading: boolean; error?: Error }> = {
    translations: state(),
    catechism: state(passages),
    summa: state(articles, lectures),
    homilies: state(passages),
    councils: state(passages),
    popes: state(talks),
    mass: state(readings),
  }
  return { ...found, counts, status }
}

export type VerseReferences = ReturnType<typeof useVerseReferences>

/**
 * The half page for a verse: the kinds that have something to show of it, in
 * the order of its line, and the one in hand. A commentator silent on the
 * verse and a kind nothing in cites it are left off the line; where that is
 * the kind last chosen, the first on the line stands in and the choice is
 * kept for the verses that have it.
 */
export function useVersePane(
  bookId: string,
  chapter: number,
  verse: number | undefined,
  commentary: ReturnType<typeof useChapterCommentary>,
) {
  const chosen = useBibleStore((s) => s.paneKind)
  const references = useVerseReferences(bookId, chapter, verse ?? 0, verse !== undefined)
  // A kind still being read keeps its place, so the line does not jump as it fills.
  const kinds = [
    ...commentary.sources
      .filter(
        (s) =>
          commentary.isLoading ||
          entriesForVerse(commentary.bySource[s.id] ?? [], verse ?? 0).length > 0,
      )
      .map((s) => s.id),
    ...referenceKinds.filter((id) => references.status[id].isLoading || references.counts[id] > 0),
  ]
  return { references, kinds, kind: kinds.includes(chosen) ? chosen : kinds[0] }
}

export type VersePaneState = ReturnType<typeof useVersePane>
