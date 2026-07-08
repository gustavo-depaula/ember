import { Platform } from 'react-native'
import { clearCache, getCached, setCache } from '@/db/repositories/cache'
import { getPreference, setPreference } from '@/db/repositories/preferences'

const remoteUrl = 'https://ember.dpgu.me/hearth/v2'
const localUrl = Platform.OS === 'web' ? 'http://localhost:4100' : 'http://10.99.99.4:4100'

let useLocal = __DEV__
let initialized = false

export async function initHearth() {
  if (initialized) return
  initialized = true
  if (__DEV__) {
    const pref = await getPreference('hearth-local')
    useLocal = pref !== 'false'
  }
}

export function isLocalHearth(): boolean {
  return __DEV__ && useLocal
}

export async function setLocalHearth(local: boolean) {
  useLocal = local
  await setPreference('hearth-local', String(local))
  await clearCache('hearth:')
}

function getBaseUrl(): string {
  return __DEV__ && useLocal ? localUrl : remoteUrl
}

export function hearthUrl(path: string): string {
  return `${getBaseUrl()}/${path}`
}

// Static published assets (e.g. saint card images) under the corpus's static
// tree. Resolves against whichever hearth is active — the local dev server when
// it's serving the full tree (so freshly-added assets show before a deploy),
// otherwise the remote CDN (and always remote in production builds).
export function hearthAssetUrl(path: string): string {
  return hearthUrl(path)
}

export async function fetchHearth<T>(
  path: string,
  { networkFirst = false }: { networkFirst?: boolean } = {},
): Promise<T> {
  const isLocal = __DEV__ && useLocal
  const key = `hearth:${path}`
  // ETag lives under the same `hearth:` prefix so clearCache('hearth:') wipes
  // it alongside the body — no separate cleanup on a hearth switch.
  const etagKey = `${key}:etag`

  if (!isLocal && !networkFirst) {
    const cached = await getCached<T>(key)
    if (cached) return cached
  }

  // `conditional` revalidates against the CDN's ETag: an unchanged file comes
  // back 304 with no body, so we skip the download, the JSON.parse, and the
  // SQLite re-write entirely. Only meaningful against the remote (production);
  // dev always fetches fresh.
  async function fetchFrom(baseUrl: string, timeoutMs: number, conditional: boolean): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const headers: Record<string, string> = {}
    if (conditional) {
      const etag = await getCached<string>(etagKey)
      if (etag) headers['If-None-Match'] = etag
    }
    let res: Response
    try {
      res = await fetch(`${baseUrl}/${path}`, { signal: controller.signal, headers })
    } finally {
      clearTimeout(timeout)
    }
    if (res.status === 304) {
      const cached = await getCached<T>(key)
      if (cached !== undefined) return cached
      // The validator outlived the body (cache cleared but etag kept). Re-fetch
      // unconditionally to recover a body.
      return fetchFrom(baseUrl, timeoutMs, false)
    }
    if (!res.ok) throw new Error(`Hearth ${path}: ${res.status}`)
    const data = (await res.json()) as T
    if (!isLocal) {
      await setCache(key, data)
      const etag = res.headers.get('etag')
      if (etag) await setCache(etagKey, etag)
    }
    return data
  }

  try {
    // Fail fast on local dev so the boot splash doesn't block 15s when the
    // dev hearth (e.g. on a LAN IP that may not be reachable) is offline.
    return await fetchFrom(getBaseUrl(), isLocal ? 3_000 : 15_000, !isLocal)
  } catch (err) {
    // Local-dev fallback: when the dev hearth is offline, transparently fall
    // back to the remote so the app stays functional. Only on network/timeout
    // errors — re-throw if the user's offline.
    if (isLocal) {
      try {
        return await fetchFrom(remoteUrl, 15_000, false)
      } catch (remoteErr) {
        console.warn('[hearth] local + remote fetch failed for', path, remoteErr)
      }
    }
    if (networkFirst && !isLocal) {
      const cached = await getCached<T>(key)
      if (cached) return cached
    }
    throw err
  }
}
