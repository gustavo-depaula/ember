import { getCached, setCache } from '@/db/repositories/cache'

const baseUrl = 'https://ember.dpgu.me/hearth/v1'

export function hearthUrl(path: string): string {
  return `${baseUrl}/${path}`
}

export async function fetchHearth<T>(path: string): Promise<T> {
  const key = `hearth:${path}`
  const cached = await getCached<T>(key)
  if (cached) return cached

  const res = await fetch(`${baseUrl}/${path}`)
  if (!res.ok) throw new Error(`Hearth ${path}: ${res.status}`)
  const data: T = await res.json()
  await setCache(key, data)
  return data
}
