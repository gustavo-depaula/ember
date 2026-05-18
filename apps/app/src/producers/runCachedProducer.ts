import {
  type ExternalContentKey,
  getExternalContent,
  putExternalContent,
} from '@/db/repositories/externalContent'
import type { Producer, ProducerContext, ProducerResult } from './types'

export type CachedProducerResult = {
  payload: ProducerResult
  fetchedAt: number
}

function paramsKeyFor(params: Record<string, unknown> | undefined): string {
  if (!params) return ''
  const keys = Object.keys(params).sort()
  if (keys.length === 0) return ''
  return JSON.stringify(params, keys)
}

function keyFor(producer: Producer, ctx: ProducerContext): ExternalContentKey {
  return {
    producerId: producer.id,
    producerVersion: producer.version,
    lang: ctx.prefs.lang,
    cacheKey: producer.cacheKey(ctx),
    paramsKey: paramsKeyFor(ctx.params),
  }
}

// SQLite is consulted first; on miss, produce() runs and the result is
// persisted for cold-start replay. TanStack Query still sits above this and
// caches in memory within the session — this layer just makes the cache
// survive app restarts.
export async function runCachedProducer(
  producer: Producer,
  ctx: ProducerContext,
): Promise<CachedProducerResult> {
  const key = keyFor(producer, ctx)
  const cached = await getExternalContent(key)
  if (cached) return { payload: cached.payload, fetchedAt: cached.fetchedAt }

  const result = await producer.produce(ctx)
  const fetchedAt = Date.now()
  await putExternalContent(key, result, fetchedAt)
  return { payload: result, fetchedAt }
}
