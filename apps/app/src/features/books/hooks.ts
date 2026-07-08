import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getBookEntry } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'

/**
 * Resolve a book's full `BookEntry` manifest by bare id, fetching on demand so
 * an unwarmed book (deep link, or before the deferred warm lands) resolves fast
 * without a boot-time warm. `initialData` seeds from the resident manifest when
 * it's already loaded (normal navigation), so only a cold open pays the async
 * fetch. `entry` (the lightweight catalog hit) is returned alongside for title /
 * language fallbacks while the body loads.
 */
export function useBookManifest(bookId: string | undefined) {
  const catalogVersion = useCatalogVersion()
  const id = bookId ? `book/${bookId}` : undefined
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const entry = useMemo(() => (id ? getEntry(id) : undefined), [id, catalogVersion])
  const query = useQuery({
    queryKey: ['book-manifest', entry?.hash],
    queryFn: () => ensureManifestBody<BookEntry>(entry?.hash ?? ''),
    enabled: !!entry,
    initialData: () => (bookId ? getBookEntry(bookId) : undefined),
    staleTime: Number.POSITIVE_INFINITY,
  })
  return { ...query, entry }
}
