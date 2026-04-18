import type { BilingualText } from '@ember/content-engine'
import { getRawProperForSlot, type ProperSection } from '@ember/mass-propers'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useTodayCelebration } from '@/features/calendar/hooks'
import { useToday } from '@/hooks/useToday'
import { localizeBilingual } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { fetchOfPropers } from './of/resolve'
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

export function useProperForSlot(slot: string, form: 'of' | 'ef'): UseProperForSlotResult {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const secondaryLanguage = usePreferencesStore((s) => s.secondaryLanguage)
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

  const efQuery = useQuery({
    queryKey: ['ef-propers', dateKey, slot],
    queryFn: async () => (await getRawProperForSlot(today, slot, dayCalendar, propersData)) ?? null,
    enabled: form === 'ef',
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 24 * 60 * 60 * 1000,
  })

  if (form === 'ef') {
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

  const refetch = () => {
    ofQuery.refetch()
  }
  const ofSection = ofQuery.data?.[slot] as ProperSection | undefined
  if (!ofSection) {
    return {
      data: undefined,
      isLoading: ofQuery.isLoading,
      isError: ofQuery.isError,
      refetch,
    }
  }

  return {
    data: {
      text: { primary: ofSection.text, ...(ofSection.latin ? { secondary: ofSection.latin } : {}) },
      citation: ofSection.citation,
    },
    isLoading: ofQuery.isLoading,
    isError: false,
    refetch,
  }
}
