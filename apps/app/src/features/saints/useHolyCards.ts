import { useQuery } from '@tanstack/react-query'

import { getManifest } from '@/content/resolver'
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
  /** The saint's Mass formulary ref (`sanctorale.10-04`): Mass on its date gives the card. */
  proper?: string
  /** Its chapter of the Pictorial Lives, and that chapter's closing reflection. */
  lifeChapter?: string
  reflection?: LocalizedText
  /** Two or three sentences introducing the saint, read before praying to open the card. */
  intro?: LocalizedText
}

type HolyCardsData = {
  version: number
  cards: HolyCard[]
}

const DATA_NAME = 'holy-cards'

/**
 * The bespoke holy-card catalog and the pool of starter cards offered on first
 * open. Served on the saint-of-the-day practice (the cards as one small blob,
 * fetched once on demand), so new cards ship through Hearth (data + image)
 * rather than an app release. Undefined while the catalog warms or the blob is
 * in flight.
 */
export function useHolyCardCatalog(): { cards: HolyCard[]; starters: string[] } | undefined {
  const catalogVersion = useCatalogVersion()
  const { data } = useQuery({
    queryKey: ['holy-cards', catalogVersion],
    queryFn: async () => {
      const manifest = getManifest('practice/saint-of-the-day')
      const ref = manifest?.dataHashes?.find((d) => d.name === DATA_NAME)
      if (!ref) return null
      const parsed = await getJson<HolyCardsData>(ref.hash)
      if (!parsed) return null
      return { cards: parsed.cards, starters: manifest?.holyCardStarters ?? [] }
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}

/** The bespoke holy cards — name, feast, patron, and prayer for every hand-illustrated saint. */
export function useHolyCards(): HolyCard[] | undefined {
  return useHolyCardCatalog()?.cards
}
