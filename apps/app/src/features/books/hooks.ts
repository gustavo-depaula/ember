import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { getBookCatalogEntry, getResidentBook, loadBook } from '@/content/books'
import type { BookEntry, CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { getPreference, setPreference } from '@/db/repositories'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { bookEditions, editionPreferenceKey, resolveEdition } from './editions'

/** Query options for a book's manifest — shared so every reader of it hits one cache entry. */
export function bookManifestQuery(bookId: string | undefined, entry: CatalogEntry | undefined) {
  return {
    queryKey: ['book-manifest', entry?.hash],
    queryFn: async () => {
      const book = bookId ? await loadBook(bookId) : undefined
      if (!book) throw new Error(`Book not in catalog: ${bookId}`)
      return book
    },
    enabled: !!entry,
    initialData: () => (bookId ? getResidentBook(bookId) : undefined),
    staleTime: Number.POSITIVE_INFINITY,
  }
}

/**
 * Resolve a book's full `BookEntry` manifest by bare id, fetching on demand so
 * an unwarmed book (deep link) resolves without a boot-time warm. `initialData`
 * seeds from the resident manifest, so only a cold open pays the fetch. `entry`
 * (the catalog hit) is returned for title / language fallbacks while the body loads.
 */
export function useBookManifest(bookId: string | undefined) {
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const entry = useMemo(
    () => (bookId ? getBookCatalogEntry(bookId) : undefined),
    [bookId, catalogVersion],
  )
  const query = useQuery(bookManifestQuery(bookId, entry))
  return { ...query, entry }
}

/**
 * The edition (language or translation) this book is read in, remembered per
 * book on this device. `ready` turns true once the remembered choice is read,
 * so the reader opens the right text the first time instead of switching.
 */
export function useBookEdition(
  bookId: string | undefined,
  book: BookEntry | undefined,
  langs?: string[],
) {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const queryClient = useQueryClient()
  const { data: chosen, isFetched } = useQuery({
    queryKey: ['book-edition', bookId],
    queryFn: async () =>
      bookId ? ((await getPreference(editionPreferenceKey(bookId))) ?? null) : null,
    enabled: !!bookId,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const editions = useMemo(() => bookEditions(book ?? { languages: langs }), [book, langs])
  const edition = resolveEdition(
    editions.map((e) => e.id),
    chosen ?? undefined,
    contentLanguage,
  )
  const setEdition = useCallback(
    async (id: string) => {
      if (!bookId) return
      queryClient.setQueryData(['book-edition', bookId], id)
      await setPreference(editionPreferenceKey(bookId), id)
    },
    [bookId, queryClient],
  )
  return { edition, editions, setEdition, ready: isFetched }
}
