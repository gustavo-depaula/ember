import { getPreference, setPreference } from '@/db/repositories/preferences'

// Tiny JSON-in-KV persistence for the feature's local stores (favorites, check-ins). The preferences
// table is a generic key/value store, so this needs no schema or migration.

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getPreference(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn(`[mass-times] could not parse "${key}"`, err)
    return fallback
  }
}

export function saveJson(key: string, value: unknown): Promise<void> {
  return setPreference(key, JSON.stringify(value)).catch((err) =>
    console.warn(`[mass-times] could not persist "${key}"`, err),
  )
}
