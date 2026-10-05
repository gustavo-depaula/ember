import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import { type HolyCard, loadHolyCardCatalog } from './data/holyCards'

export {
  type HolyCard,
  type HolyCardKind,
  type HolyCardRelated,
  type HolyCardShelf,
  holyCardKinds,
  holyCardShelves,
  type RelatedGroup,
} from './data/holyCards'

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
    // null, not undefined: Query v5 rejects undefined data while the catalog warms.
    queryFn: async () => (await loadHolyCardCatalog()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
    // A new corpus at launch changes the key: without the old cards meanwhile,
    // everything showing them (the You page's carousel) blinks out and back.
    placeholderData: keepPreviousData,
  })
  return data ?? undefined
}

/** The bespoke holy cards — name, feast, patron, and prayer for every hand-illustrated saint. */
export function useHolyCards(): HolyCard[] | undefined {
  return useHolyCardCatalog()?.cards
}
