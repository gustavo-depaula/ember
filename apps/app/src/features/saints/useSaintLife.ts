import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'
import { loadSaintLife, type SaintLife } from './data/saintLife'

/**
 * A card's life from the Pictorial Lives of the Saints, by the chapter the card
 * names as its own. Undefined while it loads, and for a card with no chapter.
 */
export function useSaintLife(chapter: string | undefined): SaintLife | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-life', catalogVersion, chapter, lang],
    enabled: !!chapter,
    queryFn: async (): Promise<SaintLife | null> =>
      (chapter && (await loadSaintLife(chapter, lang))) || null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
