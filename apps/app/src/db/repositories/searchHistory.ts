/**
 * Search-history repository. Local-only — queries never leave the device;
 * clearable from Settings → Privacy.
 */

import { getDb } from '../client'

const RECENT_DEDUPE_WINDOW_MS = 30_000

export async function record(query: string): Promise<void> {
  const trimmed = query.trim()
  if (!trimmed) return
  const now = Date.now()
  // Dedupes queries logged in the last 30s — prevents typing a long question
  // from filling the history with prefixes — in a single round-trip.
  await getDb().runAsync(
    `INSERT INTO search_history (query, searched_at)
     SELECT ?, ?
     WHERE NOT EXISTS (
       SELECT 1 FROM search_history
       WHERE query = ? AND searched_at > ?
     )`,
    [trimmed, now, trimmed, now - RECENT_DEDUPE_WINDOW_MS],
  )
}

export async function recent(limit = 8): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ query: string; searched_at: number }>(
    `SELECT query, MAX(searched_at) AS searched_at FROM search_history
     GROUP BY query ORDER BY searched_at DESC LIMIT ?`,
    [limit],
  )
  return rows.map((r) => r.query)
}

export async function clearAll(): Promise<void> {
  await getDb().runAsync('DELETE FROM search_history')
}
