import type { ContentLanguage } from '@ember/content-engine'
import { getDataSource } from '@ember/content-engine'
import type { Celebration, DayLiturgies, Formulary } from '@ember/mass-of'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { readLibraryAsset } from '@/content/registry'
import { useToday } from '@/hooks/useToday'
import { usePreferencesStore } from '@/stores/preferencesStore'

type EmberLang = 'la' | 'es' | 'en' | 'pt-BR' | 'it' | 'fr' | 'de'

function pickGospelText(formulary: Formulary, lang: EmberLang): string | undefined {
  const readings = formulary.readings as Record<string, unknown> | undefined
  if (!readings) return undefined
  const cycleKeys = Object.keys(readings)
  for (const cycle of cycleKeys) {
    const cycleEntry = readings[cycle] as Record<string, unknown> | undefined
    const gospel = cycleEntry?.gospel as
      | {
          body?: {
            plain?: Record<string, string>
            lines?: Record<string, unknown>
          }
          alternatives?: Array<{
            body?: { plain?: Record<string, string> }
          }>
        }
      | undefined
    if (!gospel) continue
    const direct = gospel.body?.plain?.[lang]
    if (typeof direct === 'string' && direct.trim()) return direct
    const alt = gospel.alternatives?.[0]?.body?.plain?.[lang]
    if (typeof alt === 'string' && alt.trim()) return alt
  }
  return undefined
}

function pickGospelCitation(formulary: Formulary, lang: EmberLang): string | undefined {
  const readings = formulary.readings as Record<string, unknown> | undefined
  if (!readings) return undefined
  for (const cycle of Object.keys(readings)) {
    const gospel = (readings[cycle] as Record<string, unknown> | undefined)?.gospel as
      | {
          citation?: Record<string, string>
          alternatives?: Array<{ citation?: Record<string, string> }>
        }
      | undefined
    if (!gospel) continue
    const direct = gospel.citation?.[lang]
    if (typeof direct === 'string' && direct.trim()) return direct
    const alt = gospel.alternatives?.[0]?.citation?.[lang]
    if (typeof alt === 'string' && alt.trim()) return alt
  }
  return undefined
}

function emberLang(lang: ContentLanguage): EmberLang {
  return (lang === 'en-US' ? 'en' : lang) as EmberLang
}

export type GospelOfTheDay = {
  text: string
  citation?: string
  celebration?: Celebration
}

/**
 * Fetch today's Gospel via the mass-of DataSource. Replaces the legacy
 * runtime fetch from evangelizo/liturgia-diaria. Reads from the locally
 * installed `base` library's vendored ember-extra fixtures.
 */
export function useGospelOfTheDay(): {
  data: GospelOfTheDay | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const today = useToday()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const lang = emberLang(contentLanguage)
  const dateKey = format(today, 'yyyy-MM-dd')

  const query = useQuery({
    queryKey: ['gospel-of-the-day', dateKey, lang],
    queryFn: async (): Promise<GospelOfTheDay | undefined> => {
      const source = getDataSource('mass-of')
      if (!source) return undefined
      const day = (await source.load(
        { calendar: 'of' },
        {
          fetchAsset: readLibraryAsset,
          fetchOwnAsset: (path) => readLibraryAsset('base', path),
          localize: (text) => ({
            primary:
              typeof text === 'string' ? text : ((text as Record<string, string>)[lang] ?? ''),
          }),
          t: (key) => key,
          now: () => today,
        },
      )) as DayLiturgies | undefined
      const celebration = day?.celebrations?.[0]
      if (!celebration) return undefined
      const text = pickGospelText(celebration.primary, lang)
      if (!text) return undefined
      return {
        text,
        citation: pickGospelCitation(celebration.primary, lang),
        celebration,
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  }
}
