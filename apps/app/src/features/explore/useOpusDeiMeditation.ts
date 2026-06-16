import { useQuery } from '@tanstack/react-query'
import { Platform } from 'react-native'
import { useToday } from '@/hooks/useToday'
import i18n from '@/lib/i18n'
import { fetchMeditationSummary } from '@/sources/opus-dei/meditation'
import { dateSlug } from '@/sources/opus-dei/url'

// Today's Opus Dei meditation title + lead, for the Explore featured card.
// Native only; the card falls back to a static label when this is undefined.
export function useOpusDeiMeditation() {
  const today = useToday()
  const lang = i18n.language
  const { data } = useQuery({
    queryKey: ['opus-dei-meditation-summary', lang, dateSlug(today)],
    queryFn: () => fetchMeditationSummary(lang, today),
    enabled: Platform.OS !== 'web',
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
    retry: 1,
  })
  return data
}
