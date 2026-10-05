import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import { loadSaintOfDayIndex, type SaintOfDayIndex, saintOfDayKey } from './data/saintOfDay'

export type { SaintOfDayEntry, SaintOfDayIndex } from './data/saintOfDay'

/**
 * Bilingual per-day index from the saint-of-the-day practice (name + primary
 * chapter id + first available reflection). Served as a single ~70 KB gzipped
 * blob in the corpus and fetched once on demand — content updates ship through
 * Hearth, not the app bundle. Returns undefined while the catalog warms or
 * while the blob is in flight.
 */
export function useSaintOfDayIndex(): SaintOfDayIndex | undefined {
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['saint-of-day-index', catalogVersion],
    // null, not undefined: Query v5 rejects undefined data while the catalog warms.
    queryFn: async () => (await loadSaintOfDayIndex()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}

export const todayKey = saintOfDayKey
