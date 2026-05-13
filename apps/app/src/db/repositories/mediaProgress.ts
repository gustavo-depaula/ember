/**
 * Media-progress repository — playback position per feed-item. Cheap to
 * overwrite; written every ~5s during playback by the audio player.
 */

import { getDb } from '../client'

export type MediaProgressRow = {
  itemId: string
  positionS: number
  durationS?: number
  completedAt?: number
  updatedAt: number
}

type Row = {
  item_id: string
  position_s: number
  duration_s: number | null
  completed_at: number | null
  updated_at: number
}

function rowToProgress(row: Row): MediaProgressRow {
  return {
    itemId: row.item_id,
    positionS: row.position_s,
    durationS: row.duration_s ?? undefined,
    completedAt: row.completed_at ?? undefined,
    updatedAt: row.updated_at,
  }
}

export async function getProgress(itemId: string): Promise<MediaProgressRow | undefined> {
  const row = await getDb().getFirstAsync<Row>('SELECT * FROM media_progress WHERE item_id = ?', [
    itemId,
  ])
  return row ? rowToProgress(row) : undefined
}

export async function recordProgress(
  itemId: string,
  positionS: number,
  durationS?: number,
): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO media_progress (item_id, position_s, duration_s, completed_at, updated_at)
     VALUES (?, ?, ?, NULL, ?)
     ON CONFLICT (item_id) DO UPDATE SET
       position_s = excluded.position_s,
       duration_s = excluded.duration_s,
       updated_at = excluded.updated_at`,
    [itemId, positionS, durationS ?? null, Date.now()],
  )
}

export async function markCompleted(itemId: string): Promise<void> {
  const now = Date.now()
  await getDb().runAsync(
    `INSERT INTO media_progress (item_id, position_s, duration_s, completed_at, updated_at)
     VALUES (?, 0, NULL, ?, ?)
     ON CONFLICT (item_id) DO UPDATE SET
       completed_at = excluded.completed_at,
       updated_at = excluded.updated_at`,
    [itemId, now, now],
  )
}

export async function clearProgress(itemId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM media_progress WHERE item_id = ?', [itemId])
}
