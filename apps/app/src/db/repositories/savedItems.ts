/**
 * Saved-items repository — the user's library shelf. A lightweight curation
 * layer: saving is instant and free (a ref + timestamp), and entirely separate
 * from offline availability (see `features/pinning`). `kind` is denormalized
 * from the catalog entry so the Library can group shelves without a lookup and
 * so user collections (`usercollection/<id>`, no catalog entry) can be saved too.
 */

import { broadcastChange } from '@/lib/db-shared/manager'
import { getDb } from '../client'

export type SavedItem = {
  itemId: string
  kind: string
  savedAt: number
}

type Row = {
  item_id: string
  kind: string
  saved_at: number
}

function rowToItem(row: Row): SavedItem {
  return { itemId: row.item_id, kind: row.kind, savedAt: row.saved_at }
}

// `rowid DESC` breaks ties when several items are saved in the same millisecond,
// so the most recently saved always sorts first.
export async function getSavedItems(): Promise<SavedItem[]> {
  const rows = await getDb().getAllAsync<Row>(
    'SELECT item_id, kind, saved_at FROM saved_items ORDER BY saved_at DESC, rowid DESC',
  )
  return rows.map(rowToItem)
}

export async function getSavedItemsByKind(kind: string): Promise<SavedItem[]> {
  const rows = await getDb().getAllAsync<Row>(
    'SELECT item_id, kind, saved_at FROM saved_items WHERE kind = ? ORDER BY saved_at DESC, rowid DESC',
    [kind],
  )
  return rows.map(rowToItem)
}

export async function isItemSaved(itemId: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ item_id: string }>(
    'SELECT item_id FROM saved_items WHERE item_id = ?',
    [itemId],
  )
  return Boolean(row)
}

export async function getSavedItemIds(): Promise<Set<string>> {
  const rows = await getDb().getAllAsync<{ item_id: string }>('SELECT item_id FROM saved_items')
  return new Set(rows.map((r) => r.item_id))
}

export async function saveItem(itemId: string, kind: string): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO saved_items (item_id, kind, saved_at) VALUES (?, ?, ?) ON CONFLICT (item_id) DO NOTHING',
    [itemId, kind, Date.now()],
  )
  broadcastChange({ kind: 'invalidate', tags: ['saved-items'] })
}

export async function unsaveItem(itemId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM saved_items WHERE item_id = ?', [itemId])
  broadcastChange({ kind: 'invalidate', tags: ['saved-items'] })
}
