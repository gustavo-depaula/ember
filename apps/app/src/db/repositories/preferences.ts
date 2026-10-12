import { broadcastChange } from '@/lib/db-shared/manager'

import { getDb } from '../client'
import { emit, useEventStore } from '../events'

/**
 * The preferences that follow the person from device to device: which Bible,
 * which calendar, which languages. They live in the event log, each a whole
 * value where the last one set wins. Every other key is this device's own —
 * how the page looks on this screen, what is downloaded here, what this
 * install has already shown — and stays in the `preferences` table.
 */
export const syncedPreferences = new Set([
  'translation',
  'psalter-cycle',
  'language',
  'jurisdiction',
  'content-language',
  'secondary-language',
  'display-mode',
  'bible-commentary',
])

function synced(): Map<string, string> {
  return useEventStore.getState().preferences
}

export async function getPreference(key: string): Promise<string | undefined> {
  if (syncedPreferences.has(key)) return synced().get(key)
  const row = await getDb().getFirstAsync<{ value: string }>(
    'SELECT value FROM preferences WHERE key = ?',
    [key],
  )
  return row?.value
}

export async function setPreference(key: string, value: string): Promise<void> {
  if (syncedPreferences.has(key)) {
    if (synced().get(key) !== value) await emit({ type: 'PreferenceSet', key, value })
    return
  }
  await getDb().runAsync(
    'INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
    [key, value],
  )
  broadcastChange({ kind: 'invalidate', tags: ['preferences'] })
}

export async function removePreference(key: string): Promise<void> {
  if (syncedPreferences.has(key)) {
    if (synced().has(key)) await emit({ type: 'PreferenceSet', key, value: null })
    return
  }
  await getDb().runAsync('DELETE FROM preferences WHERE key = ?', [key])
  broadcastChange({ kind: 'invalidate', tags: ['preferences'] })
}

export async function getAllPreferences(): Promise<Record<string, string>> {
  const rows = await getDb().getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM preferences',
  )
  return {
    ...Object.fromEntries(rows.map((row) => [row.key, row.value])),
    ...Object.fromEntries(synced()),
  }
}
