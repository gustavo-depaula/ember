import type { Primitive } from '@/content/primitives'
import {
  type ExternalContentKey,
  getExternalContent,
  putExternalContent,
} from '@/db/repositories/externalContent'
import type { ContentSource, ProducerPrefs, SourceFetchContext } from './types'

export type CachedSourceResult = {
  payload: Primitive | Primitive[]
  fetchedAt: number
}

function stableStringify(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort()
  if (keys.length === 0) return ''
  return JSON.stringify(obj, keys)
}

function cacheKeyFor(
  source: ContentSource,
  params: Record<string, unknown>,
  prefs: ProducerPrefs,
): string {
  const prefsSubset: Record<string, unknown> = {}
  for (const key of source.prefsDeps) prefsSubset[key] = prefs[key]
  return `${stableStringify(prefsSubset)}::${stableStringify(params)}`
}

function externalKey(source: ContentSource, ctx: SourceFetchContext): ExternalContentKey {
  return {
    producerId: source.id,
    producerVersion: source.version,
    lang: ctx.prefs.lang,
    cacheKey: cacheKeyFor(source, ctx.params, ctx.prefs),
    paramsKey: '',
  }
}

// SQLite read on cold cache; fetch() runs on miss and persists. React Query
// sits above and dedupes in-session, so this layer only fires on cold start.
export async function runCachedSource(
  source: ContentSource,
  ctx: SourceFetchContext,
): Promise<CachedSourceResult> {
  const key = externalKey(source, ctx)
  const cached = await getExternalContent(key)
  if (cached)
    return { payload: cached.payload as Primitive | Primitive[], fetchedAt: cached.fetchedAt }

  const result = await source.fetch(ctx)
  const fetchedAt = Date.now()
  await putExternalContent(key, result, fetchedAt)
  return { payload: result, fetchedAt }
}

export { cacheKeyFor }
