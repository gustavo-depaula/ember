import { clearCache, getCached, setCache } from '@/db/repositories/cache'
import { getPreference, setPreference } from '@/db/repositories/preferences'

const remoteUrl = 'https://ember.dpgu.me/hearth/v1'
const localUrl = 'http://192.168.15.189:4100'

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

export async function fetchHearth<T>(path: string): Promise<T> {
  const isLocal = __DEV__ && useLocal

  if (!isLocal) {
    const key = `hearth:${path}`
    const cached = await getCached<T>(key)
    if (cached) return cached
  }

  const res = await fetch(`${getBaseUrl()}/${path}`)
  if (!res.ok) throw new Error(`Hearth ${path}: ${res.status}`)
  const data: T = await res.json()

  if (!isLocal) {
    await setCache(`hearth:${path}`, data)
  }

  return data
}
