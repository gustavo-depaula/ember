import type { EmberDb } from '@/lib/db-shared/protocol'

import { emitBatch, useEventStore } from './events'
import type { AppEvent } from './events/types'
import { syncedPreferences } from './repositories/preferences'

// The shelf, the user's collections and the preferences that follow the person
// were rows in tables of their own, which only this database could read. They
// belong to the event log now; rows written before are carried into it here,
// and their tables dropped. Carrying them twice would change nothing, so a
// launch cut short between the two steps is safe.
export async function adoptLegacyTables(db: EmberDb): Promise<void> {
  const tables = new Set(
    (
      await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('saved_items', 'user_collections', 'user_collection_items')",
      )
    ).map((row) => row.name),
  )
  const travelling = 'key IN (SELECT value FROM json_each(?))'
  const keys = [JSON.stringify([...syncedPreferences])]
  const preferences = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM preferences WHERE ${travelling}`,
    keys,
  )
  if (tables.size === 0 && preferences.length === 0) return

  const events: AppEvent[] = []

  if (tables.has('saved_items')) {
    const rows = await db.getAllAsync<{ item_id: string; kind: string; saved_at: number }>(
      'SELECT item_id, kind, saved_at FROM saved_items ORDER BY saved_at, rowid',
    )
    for (const row of rows) {
      events.push({ type: 'ItemSaved', itemId: row.item_id, kind: row.kind, savedAt: row.saved_at })
    }
  }

  if (tables.has('user_collections')) {
    const collections = await db.getAllAsync<{
      id: string
      name: string
      description: string | null
      cover_tone: number
      created_at: number
      updated_at: number
    }>('SELECT * FROM user_collections')
    const items = tables.has('user_collection_items')
      ? await db.getAllAsync<{ collection_id: string; ref: string; added_at: number }>(
          'SELECT collection_id, ref, added_at FROM user_collection_items ORDER BY section_id, position',
        )
      : []
    for (const row of collections) {
      events.push({
        type: 'CollectionCreated',
        collectionId: row.id,
        name: row.name,
        description: row.description ?? undefined,
        coverTone: row.cover_tone,
        at: row.created_at,
      })
      for (const item of items.filter((i) => i.collection_id === row.id)) {
        events.push({
          type: 'CollectionItemAdded',
          collectionId: row.id,
          ref: item.ref,
          at: item.added_at,
        })
      }
      // Its place on the shelf is when it last changed, not when its last member joined.
      events.push({ type: 'CollectionUpdated', collectionId: row.id, at: row.updated_at })
    }
  }

  const known = useEventStore.getState().preferences
  for (const { key, value } of preferences) {
    if (!known.has(key)) events.push({ type: 'PreferenceSet', key, value })
  }

  if (events.length > 0) await emitBatch(events)
  await db.runBatchInTx([
    { sql: 'DROP TABLE IF EXISTS user_collection_items' },
    { sql: 'DROP TABLE IF EXISTS user_collections' },
    { sql: 'DROP TABLE IF EXISTS saved_items' },
    { sql: `DELETE FROM preferences WHERE ${travelling}`, params: keys },
  ])
}
