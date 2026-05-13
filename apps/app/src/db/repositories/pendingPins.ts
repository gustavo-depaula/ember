/**
 * Queue of feed-item pins deferred until Wi-Fi reconnects. The Wi-Fi-only
 * preference is a hard gate — we do not silently fall back to cellular.
 */

import { getDb } from '../client'

export async function enqueuePin(itemId: string): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO pending_pins (item_id, queued_at) VALUES (?, ?) ON CONFLICT (item_id) DO NOTHING',
    [itemId, Date.now()],
  )
}

export async function dequeuePin(itemId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM pending_pins WHERE item_id = ?', [itemId])
}

export async function getPending(): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ item_id: string }>(
    'SELECT item_id FROM pending_pins ORDER BY queued_at ASC',
  )
  return rows.map((r) => r.item_id)
}

export async function clearPending(): Promise<void> {
  await getDb().runAsync('DELETE FROM pending_pins')
}
