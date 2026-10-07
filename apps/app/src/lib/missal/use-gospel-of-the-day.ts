import type { Lang } from '@ember/missal'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Platform } from 'react-native'
import { useToday } from '@/hooks/useToday'
import { fetchVaticanGospelText, narrowLang } from '@/sources/vatican-news'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { type GospelOfDay, loadGospelOfDay } from './gospelOfDay'

export type GospelOfTheDay = GospelOfDay

/**
 * Today's Gospel (text + citation). Vatican News is the primary source on
 * native, with the corpus-computed Gospel as the offline / web (CORS)
 * fallback.
 */
export function useGospelOfTheDay(): {
  data: GospelOfTheDay | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const today = useToday()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const dateKey = format(today, 'yyyy-MM-dd')
  const query = useQuery({
    queryKey: ['gospel-of-the-day', dateKey, contentLanguage],
    queryFn: async (): Promise<GospelOfTheDay | null> => {
      if (Platform.OS !== 'web') {
        const vn = await fetchVaticanGospelText(narrowLang(contentLanguage), today)
        if (vn) return vn
      }
      return (await loadGospelOfDay(today, contentLanguage as Lang)) ?? null
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
