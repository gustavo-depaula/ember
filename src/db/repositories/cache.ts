import { getDb } from '../client'

export async function getCached<T>(key: string): Promise<T | undefined> {
  const row = await getDb().getFirstAsync<{ data: string }>(
    'SELECT data FROM cache WHERE key = ?',
    [key],
  )
  if (!row) return undefined
  return JSON.parse(row.data) as T
}

export async function setCache(key: string, data: unknown): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO cache (key, data, cached_at) VALUES (?, ?, ?) ON CONFLICT (key) DO UPDATE SET data = excluded.data, cached_at = excluded.cached_at',
    [key, JSON.stringify(data), Date.now()],
  )
}

export async function clearCache(prefix: string): Promise<void> {
  await getDb().runAsync('DELETE FROM cache WHERE key LIKE ?', [`${prefix}%`])
}
