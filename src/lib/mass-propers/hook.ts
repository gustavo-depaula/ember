import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

import { useTodayCelebration } from '@/features/calendar/hooks'
import { useToday } from '@/hooks/useToday'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { fetchOfPropers } from './of/resolve'
import { getProperForSlot } from './resolve'
import type { ProperSection } from './types'

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
      data: getProperForSlot(today, slot, dayCalendar),
      isLoading: false,
    }
  }

  return {
    data: ofQuery.data?.[slot],
    isLoading: ofQuery.isLoading,
  }
}
