import { useQuery } from '@tanstack/react-query'
import { useToday } from '@/hooks/useToday'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePracticeProducerCtx } from './PracticeProducerContext'
import { getProducer } from './registry'
import { type CachedProducerResult, runCachedProducer } from './runCachedProducer'
import type { DataProducer, Producer, ProducerContext } from './types'

export type UseProducerResult = {
  producer: Producer | undefined
  data: CachedProducerResult | undefined
  isLoading: boolean
  isError: boolean
  retry: () => void
}

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

  // cacheKey is the producer's canonical "what identifies this call" — params
  // are embedded in it, so we don't repeat them in the queryKey.
  const query = useQuery({
    queryKey: [
      'producer',
      ref,
      producer?.version ?? '?',
      producer ? producer.cacheKey(ctx) : '',
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

// Typed wrapper for data-kind producers: lets the caller pass the producer
// object (preserving its T) and erases the `as { data: T }` cast at every
// slot. Skips the registry lookup since the caller already has the producer.
export function useDataProducer<T>(
  producer: DataProducer<T>,
  params?: Record<string, unknown>,
): { data: T | undefined; isError: boolean; retry: () => void } {
  const { data, isError, retry } = useProducer(producer.id, params)
  return {
    data: (data?.payload as { data: T } | undefined)?.data,
    isError,
    retry,
  }
}
