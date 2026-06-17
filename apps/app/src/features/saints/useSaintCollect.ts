import { resolveOfDay } from '@ember/mass'
import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'
import { loadMassFormulary, loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'

type Collect = { lang: string; lines: string[] }

// The Collect (opening prayer) proper to a saint's feast, resolved through the
// OF calendar: the feast date → the day's principal celebration → its formulary
// → the collect's lines in the active language. Many sanctoral days carry no
// collect (≈40%). The query returns `null` (never `undefined`, which TanStack
// Query forbids) for those, and the encounter simply omits the slot.
export function useSaintCollect(
  feast: { month: number; day: number } | undefined,
): Collect | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-collect', catalogVersion, feast?.month, feast?.day, lang],
    enabled: !!feast,
    queryFn: async (): Promise<Collect | null> => {
      if (!feast) return null
      const calendar = await loadOfCalendar()
      if (!calendar) return null
      // Year is arbitrary — the sanctoral is keyed by month/day.
      const date = new Date(2025, feast.month - 1, feast.day)
      const day = resolveOfDay(date, calendar, { scope: scopeForContentLang(lang) })
      const principal = day.celebrations[0]
      if (!principal) return null
      const formulary = await loadMassFormulary(principal.ref)
      const body = formulary?.collect?.options?.[0]?.body as
        | { lines?: Record<string, Array<{ text?: string }>> }
        | undefined
      const byLang = body?.lines
      if (!byLang) return null
      const picked = byLang[lang] ?? byLang['en-US'] ?? byLang.la
      if (!picked) return null
      const lines = picked.map((l) => l.text ?? '').filter(Boolean)
      if (lines.length === 0) return null
      return { lang, lines }
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}
