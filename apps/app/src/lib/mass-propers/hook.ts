import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { useTodayCelebration } from '@/features/calendar/hooks'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { getProperForSlot, type ProperSection } from '@ember/mass-propers'
import { fetchOfPropers } from './of/resolve'
import * as propersData from './propers-data'

export function useProperForSlot(
  slot: string,
  form: 'of' | 'ef',
): { data: ProperSection | undefined; isLoading: boolean } {
  const language = usePreferencesStore((s) => s.language)
  const today = useToday()
  const dayCalendar = useTodayCelebration()
  const dateKey = format(today, 'yyyy-MM-dd')

  const ofQuery = useQuery({
    queryKey: ['of-propers', dateKey, language],
    queryFn: () => fetchOfPropers(today, language),
    enabled: form === 'of',
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
  })

  if (form === 'ef') {
    return {
      data: getProperForSlot(today, slot, dayCalendar, propersData, localizeContent),
      isLoading: false,
    }
  }

  return {
    data: ofQuery.data?.[slot],
    isLoading: ofQuery.isLoading,
  }
}
