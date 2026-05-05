import type { BilingualText } from '@ember/content-engine'
import { getRawProperForSlot } from '@ember/mass-propers'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useTodayCelebration } from '@/features/calendar/hooks'
import { useToday } from '@/hooks/useToday'
import { localizeBilingual } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import * as propersData from './propers-data'

type BilingualProperSection = {
  text: BilingualText
  citation?: string
}

type UseProperForSlotResult = {
  data: BilingualProperSection | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

/**
 * Resolve a single proper slot for the EF Mass. OF Mass now goes through the
 * mass-of DataSource + choice-rich-text primitive — flows no longer emit
 * `proper` markers with form: 'of'.
 */
export function useProperForSlot(slot: string, form: 'ef'): UseProperForSlotResult {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
  const today = useToday()
  const dayCalendar = useTodayCelebration()
  const dateKey = format(today, 'yyyy-MM-dd')

  const efQuery = useQuery({
    queryKey: ['ef-propers', dateKey, slot],
    queryFn: async () => (await getRawProperForSlot(today, slot, dayCalendar, propersData)) ?? null,
    enabled: form === 'ef',
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
  })

  const raw = efQuery.data
  const refetch = () => {
    efQuery.refetch()
  }
  if (!raw) {
    return {
      data: undefined,
      isLoading: efQuery.isLoading,
      isError: efQuery.isError,
      refetch,
    }
  }

  return {
    data: {
      text: localizeBilingual(
        { 'en-US': raw['en-US'] ?? '', 'pt-BR': raw['pt-BR'], la: raw.la },
        contentLanguage,
        secondaryLanguage,
      ),
      citation: raw.citation,
    },
    isLoading: false,
    isError: false,
    refetch,
  }
}
