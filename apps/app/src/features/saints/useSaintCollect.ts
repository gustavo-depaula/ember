import { resolveOfDay } from '@ember/mass'
import { useQuery } from '@tanstack/react-query'

import { useCatalogVersion } from '@/content/useCatalogVersion'
import i18n from '@/lib/i18n'
import { loadMassFormulary, loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'

type Collect = { lang: string; lines: string[] }

// The Collect (opening prayer) proper to a saint: the card's own formulary
// (`proper`) when it names one, else the one of the day's principal celebration
// on the feast date — in the active language. Many sanctoral days carry no
// collect (≈40%). The query returns `null` (never `undefined`, which TanStack
// Query forbids) for those, and callers simply omit the prayer.
export function useSaintCollect({
  feast,
  proper,
}: {
  feast?: { month: number; day: number }
  proper?: string
}): Collect | undefined {
  const catalogVersion = useCatalogVersion()
  const lang = i18n.language || 'en-US'
  const { data } = useQuery({
    queryKey: ['saint-collect', catalogVersion, proper, feast?.month, feast?.day, lang],
    enabled: !!(proper || feast),
    queryFn: async (): Promise<Collect | null> => {
      const ref = proper ?? (feast && (await principalRef(feast, lang)))
      if (!ref) return null
      const formulary = await loadMassFormulary(ref)
      const body = formulary?.collect?.options?.[0]?.body as
        // Each line is a run of styled text spans.
        { lines?: Record<string, Array<Array<{ text?: string }>>> } | undefined
      const byLang = body?.lines
      if (!byLang) return null
      const picked = byLang[lang] ?? byLang['en-US'] ?? byLang.la
      if (!picked) return null
      const lines = picked.map((line) => line.map((run) => run.text ?? '').join('')).filter(Boolean)
      if (lines.length === 0) return null
      return { lang, lines }
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
  return data ?? undefined
}

async function principalRef(
  feast: { month: number; day: number },
  lang: string,
): Promise<string | undefined> {
  const calendar = await loadOfCalendar()
  if (!calendar) return undefined
  // Year is arbitrary — the sanctoral is keyed by month/day.
  const date = new Date(2025, feast.month - 1, feast.day)
  return resolveOfDay(date, calendar, { scope: scopeForContentLang(lang) }).celebrations[0]?.ref
}
