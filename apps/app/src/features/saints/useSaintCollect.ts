import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'
import { loadSaintCollect, type SaintCollect } from './data/saintCollect'

// The encounter omits the slot for a card with no proper formulary. The query
// answers `null` there, never `undefined`, which TanStack Query forbids.
export function useSaintCollect(proper: string | undefined): SaintCollect | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-collect', catalogVersion, proper, lang],
    enabled: !!proper,
    queryFn: async (): Promise<SaintCollect | null> =>
      (proper && (await loadSaintCollect(proper, lang))) || null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
