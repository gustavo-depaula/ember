import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { useToday } from '@/hooks/useToday'
import { fetchVaticanGospelText, narrowLang } from '@/sources/vatican-news'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { emberLang, type GospelOfDay, loadGospelOfDay } from './gospelOfDay'

export type GospelOfTheDay = GospelOfDay

/**
 * Fetch today's Gospel via the registered `mass-of` DataSource — the
 * source closes over its typed corpus accessor at registration time, so
 * we only need to provide a `SourceContext` for localization and `now()`.
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
    queryFn: async (): Promise<GospelOfTheDay | null> => {
      // Prefer Vatican News (native) so this card matches the practice's
      // Gospel tab; fall back to the offline mass-of Gospel on web/failure.
      if (Platform.OS !== 'web') {
        const vn = await fetchVaticanGospelText(narrowLang(contentLanguage), today)
        if (vn) return vn
      }
      return (await loadGospelOfDay(today, lang)) ?? null
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  return {
    data: query.data ?? undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  }
}
