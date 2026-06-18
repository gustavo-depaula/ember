import { useQuery } from '@tanstack/react-query'

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'
import type { LocalizedText } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'

// A single bespoke holy card — the hand-illustrated, collected saints. The
// `id` doubles as the image stem (`saints/{id}.webp`). All display strings are
// localized; the feast is the calendar spine the gallery sorts and groups by.
export type HolyCard = {
  id: string
  feast: { month: number; day: number }
  name: LocalizedText
  patronOf?: LocalizedText
  prayerExcerpt?: LocalizedText
}

type HolyCardsData = {
  version: number
  cards: HolyCard[]
}

const DATA_NAME = 'holy-cards'

/**
 * The bespoke holy-card catalog — name, feast, patron, and prayer for every
 * hand-illustrated saint. Served as one small blob on the saint-of-the-day
 * practice and fetched once on demand, so new cards ship through Hearth (data +
 * image) rather than an app release. Returns undefined while the catalog warms
 * or the blob is in flight.
 */
export function useHolyCards(): HolyCard[] | undefined {
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['holy-cards', catalogVersion],
    queryFn: async () => {
      const entry = getEntry('practice/saint-of-the-day')
      if (!entry) return undefined
      const manifest = getRememberedManifest<PracticeManifest>(entry.hash)
      const ref = manifest?.dataHashes?.find((d) => d.name === DATA_NAME)
      if (!ref) return undefined
      const parsed = await getJson<HolyCardsData>(ref.hash)
      return parsed?.cards
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
