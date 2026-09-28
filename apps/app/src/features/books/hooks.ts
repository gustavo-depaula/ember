import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getBookCatalogEntry, getResidentBook, loadBook } from '@/content/books'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'

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
