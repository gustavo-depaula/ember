import { Platform } from 'react-native'
import { clearCache, getCached, setCache } from '@/db/repositories/cache'
import { getPreference, setPreference } from '@/db/repositories/preferences'

const remoteUrl = 'https://ember.dpgu.me/hearth/v2'
const localUrl = Platform.OS === 'web' ? 'http://localhost:4100' : 'http://172.20.10.3:4100'

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

export async function fetchHearth<T>(
  path: string,
  { networkFirst = false }: { networkFirst?: boolean } = {},
): Promise<T> {
  const isLocal = __DEV__ && useLocal
  const key = `hearth:${path}`

  if (!isLocal && !networkFirst) {
    const cached = await getCached<T>(key)
    if (cached) return cached
  }

  async function fetchFrom(baseUrl: string, timeoutMs: number): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(`${baseUrl}/${path}`, { signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }
    if (!res.ok) throw new Error(`Hearth ${path}: ${res.status}`)
    return (await res.json()) as T
  }

  try {
    // Fail fast on local dev so the boot splash doesn't block 15s when the
    // dev hearth (e.g. on a LAN IP that may not be reachable) is offline.
    const data = await fetchFrom(getBaseUrl(), isLocal ? 3_000 : 15_000)
    if (!isLocal) await setCache(key, data)
    return data
  } catch (err) {
    // Local-dev fallback: when the dev hearth is offline, transparently fall
    // back to the remote so the app stays functional. Only on network/timeout
    // errors — re-throw if the user's offline.
    if (isLocal) {
      try {
        return await fetchFrom(remoteUrl, 15_000)
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
