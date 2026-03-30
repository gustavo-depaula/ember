import { getDb } from '../client'

export async function getPreference(key: string): Promise<string | undefined> {
  const row = await getDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM preferences WHERE key = ?',
    [key],
  )
  return row?.value
}

export async function setPreference(key: string, value: string): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
    [key, value],
  )
}

export async function removePreference(key: string): Promise<void> {
  await getDb().runAsync('DELETE FROM preferences WHERE key = ?', [key])
}

export async function getAllPreferences(): Promise<Record<string, string>> {
  const rows = await getDb().getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM preferences',
  )
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}
