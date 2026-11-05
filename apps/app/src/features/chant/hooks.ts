import { type UseQueryResult, useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getEntry } from '@/content/contentIndex'
import { getJson } from '@/content/store'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { type Chant, type ChantBook, chantBookEntries, loadChant, loadChantBook } from './chants'
import { chantDays, chantEntries, placesOfChants } from './library'

function chantBookQuery(id: string, catalogVersion: number, enabled = true) {
  return {
    queryKey: ['chant-book', id, catalogVersion],
    queryFn: async () => (await loadChantBook(id)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
    enabled,
  }
}

export function useChantBook(id: string) {
  const catalogVersion = useCatalogVersion()
  return useQuery(chantBookQuery(id, catalogVersion))
}

/** Every chant book, each read once under the key `useChantBook` reads it by. */
export function useChantBooks(enabled = true) {
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: the catalog's books change with its version
  const ids = useMemo(() => chantBookEntries().map((entry) => entry.id), [catalogVersion])
  return useQueries({
    queries: ids.map((id) => chantBookQuery(id, catalogVersion, enabled)),
    combine: allBooks,
  })
}

// Module-level, so TanStack keeps the combined result while no book changes.
function allBooks(results: UseQueryResult<ChantBook | null>[]) {
  return {
    data: results.every((r) => r.data !== undefined)
      ? results.flatMap((r) => (r.data ? [r.data] : []))
      : undefined,
    isError: results.some((r) => r.isError),
    refetch: () => {
      for (const r of results) r.refetch()
    },
  }
}

/** Every chant of the catalog, its name folded for search once per catalog. */
export function useChantEntries() {
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: the catalog's chants change with its version
  return useMemo(() => chantEntries(), [catalogVersion])
}

/** Where each chant is sung, across every book. */
export function useChantPlaces(enabled = true) {
  const books = useChantBooks(enabled)
  const places = useMemo(() => placesOfChants(books.data ?? []), [books.data])
  return { ...books, places }
}

export function useChant(id: string) {
  const catalogVersion = useCatalogVersion()
  return useQuery({
    queryKey: ['chant', id, catalogVersion],
    queryFn: async (): Promise<Chant | null> => (await loadChant(id)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

/**
 * Today and the six days after it, on the 1962 calendar: one week resolved
 * once, of which a book's ribbon reads only today. Keyed by the date, so a new
 * day reads afresh.
 */
export function useChantWeek() {
  const today = new Date()
  const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const catalogVersion = useCatalogVersion()
  return useQuery({
    queryKey: ['chant-week', key, catalogVersion],
    queryFn: () => chantDays(today, 7),
    staleTime: Number.POSITIVE_INFINITY,
  })
}

/** The words every chant sings, folded for search: read only once a search needs it. */
export function useChantTexts(enabled: boolean) {
  const catalogVersion = useCatalogVersion()
  return useQuery({
    queryKey: ['chant-text', catalogVersion],
    queryFn: async () => {
      const entry = getEntry('chant-text/all')
      return entry ? await getJson<Record<string, string>>(entry.hash) : null
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled,
  })
}
