import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'
import { loadMassFormulary } from '@/lib/mass-of/loaders'

type Collect = { lang: string; lines: string[] }

// The Collect (opening prayer) of the Mass formulary a card names as its own
// (`proper`), in the active language. Resolved by id, never by date: a date's
// first celebration is often a Sunday, a weekday, or another saint. Cards without
// a proper formulary (≈40% of optional memorials have none) return `null` (never
// `undefined`, which TanStack Query forbids), and the encounter omits the slot.
export function useSaintCollect(proper: string | undefined): Collect | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-collect', catalogVersion, proper, lang],
    enabled: !!proper,
    queryFn: async (): Promise<Collect | null> => {
      if (!proper) return null
      const formulary = await loadMassFormulary(proper)
      const body = formulary?.collect?.options?.[0]?.body as
        | { lines?: Record<string, Array<Array<{ text?: string }>>> }
        | undefined
      const byLang = body?.lines
      if (!byLang) return null
      const picked = byLang[lang] ?? byLang['en-US'] ?? byLang.la
      if (!picked) return null
      // Each line is a run of styled segments.
      const lines = picked
        .map((segments) => segments.map((s) => s.text ?? '').join(''))
        .filter(Boolean)
      if (lines.length === 0) return null
      return { lang, lines }
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
