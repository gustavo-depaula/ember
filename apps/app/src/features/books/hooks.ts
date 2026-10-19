import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { getBookCatalogEntry, getResidentBook, loadBook } from '@/content/books'
import type { BookEntry, CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { getPreference, setPreference } from '@/db/repositories'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { bookEditions, editionPreferenceKey, resolveEdition, versionView } from './editions'

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

/** Query options for the edition chosen for a book (null: none chosen). */
export function bookEditionQuery(bookId: string | undefined) {
  return {
    queryKey: ['book-edition', bookId],
    queryFn: async () =>
      bookId ? ((await getPreference(editionPreferenceKey(bookId))) ?? null) : null,
    enabled: !!bookId,
    staleTime: Number.POSITIVE_INFINITY,
  }
}

/**
 * The edition (a language of the main text or of another version) this book
 * is read in, remembered per book on this device, with the book as that
 * edition's version presents it. `ready` turns true once the remembered
 * choice is read, so the reader opens the right text the first time.
 */
export function useBookEdition(
  bookId: string | undefined,
  book: BookEntry | undefined,
  langs?: string[],
) {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const queryClient = useQueryClient()
  const { data: chosen, isFetched } = useQuery(bookEditionQuery(bookId))
  const editions = useMemo(() => bookEditions(book ?? { languages: langs }), [book, langs])
  const edition = resolveEdition(editions, chosen ?? undefined, contentLanguage)
  const view = useMemo(() => book && versionView(book, edition?.version), [book, edition?.version])
  const setEdition = useCallback(
    async (id: string) => {
      if (!bookId) return
      // Set ahead of the write, so the chosen pill moves on the tap.
      queryClient.setQueryData(['book-edition', bookId], id)
      await setPreference(editionPreferenceKey(bookId), id)
    },
    [bookId, queryClient],
  )
  return {
    /** The language read; `en-US` while nothing is known yet. */
    lang: edition?.language ?? 'en-US',
    version: edition?.version,
    edition: edition?.id ?? 'en-US',
    editions,
    view,
    setEdition,
    ready: isFetched,
  }
}
