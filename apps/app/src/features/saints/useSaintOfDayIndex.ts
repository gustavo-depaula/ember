import { useQuery } from '@tanstack/react-query'

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'
import type { LocalizedText } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'

export type SaintOfDayEntry = {
  name: LocalizedText
  /** Primary chapter id (matches the image filename in the book). */
  chapter: string
  reflection?: LocalizedText
}

export type SaintOfDayIndex = Record<string, SaintOfDayEntry>

const INDEX_NAME = 'saint-of-day-index'

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
    queryFn: async () => {
      const entry = getEntry('practice/saint-of-the-day')
      if (!entry) return undefined
      const manifest = getRememberedManifest<PracticeManifest>(entry.hash)
      const ref = manifest?.dataHashes?.find((d) => d.name === INDEX_NAME)
      if (!ref) return undefined
      return await getJson<SaintOfDayIndex>(ref.hash)
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}

export function todayKey(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
