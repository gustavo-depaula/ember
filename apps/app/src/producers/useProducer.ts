import { useQuery } from '@tanstack/react-query'
import { useToday } from '@/hooks/useToday'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePracticeProducerCtx } from './PracticeProducerContext'
import { getProducer } from './registry'
import { type CachedProducerResult, runCachedProducer } from './runCachedProducer'
import type { Producer, ProducerContext } from './types'

export type UseProducerResult = {
  producer: Producer | undefined
  data: CachedProducerResult | undefined
  isLoading: boolean
  isError: boolean
  retry: () => void
}

// Fires a single producer call. Reads session-scoped state (prefs,
// programDay, date) from hooks/context so block components only need to
// pass their own params. React Query handles dedup across blocks with
// equal (ref, params, cacheKey).
export function useProducer(
  ref: string,
  params?: Record<string, unknown>,
): UseProducerResult {
  const lang = usePreferencesStore((s) => s.contentLanguage)
  const translation = usePreferencesStore((s) => s.translation)
  const { programDay } = usePracticeProducerCtx()
  const now = useToday()
  const producer = getProducer(ref)

  const ctx: ProducerContext = {
    date: now,
    prefs: { lang, translation },
    programDay,
    params,
  }

  const query = useQuery({
    queryKey: [
      'producer',
      ref,
      producer?.version ?? '?',
      producer ? producer.cacheKey(ctx) : '',
      params,
    ] as const,
    queryFn: async () => {
      if (!producer) throw new Error(`Unknown producer: ${ref}`)
      return runCachedProducer(producer, ctx)
    },
    staleTime: Number.POSITIVE_INFINITY,
  })

  return {
    producer,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    retry: () => {
      query.refetch()
    },
  }
}
