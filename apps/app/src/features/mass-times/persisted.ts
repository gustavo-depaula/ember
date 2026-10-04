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

/** Rejects when the write fails, so the caller can fail the interaction it belongs to. */
export function saveJson(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value)
  return withRetry(() => setPreference(key, json))
}

// SQLite refuses a write while something else holds the database ("database is
// locked"). That clears within moments, so a write is tried again before it fails.
const retryDelaysMs = [150, 500]

export async function withRetry<T>(write: () => Promise<T>): Promise<T> {
  for (const delay of retryDelaysMs) {
    try {
      return await write()
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  return write()
}
