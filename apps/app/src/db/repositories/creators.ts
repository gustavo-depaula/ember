/**
 * Creator-follow state. SQLite-only — follows are simple toggles plus a
 * per-creator auto-pin policy, not the kind of high-stakes user action where
 * event-sourced auditability earns its keep in this codebase.
 */

import { getDb } from '../client'

export type FollowRecord = {
  creatorId: string
  followedAt: number
  autoPinCount: number
}

type Row = {
  creator_id: string
  followed_at: number
  auto_pin_count: number
}

function rowToRecord(row: Row): FollowRecord {
  return {
    creatorId: row.creator_id,
    followedAt: row.followed_at,
    autoPinCount: row.auto_pin_count,
  }
}

export async function followCreator(creatorId: string): Promise<void> {
  await getDb().runAsync(
    'INSERT INTO creator_follows (creator_id, followed_at, auto_pin_count) VALUES (?, ?, 0) ON CONFLICT (creator_id) DO NOTHING',
    [creatorId, Date.now()],
  )
}

export async function unfollowCreator(creatorId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM creator_follows WHERE creator_id = ?', [creatorId])
}

export async function isFollowed(creatorId: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ creator_id: string }>(
    'SELECT creator_id FROM creator_follows WHERE creator_id = ?',
    [creatorId],
  )
  return row !== null
}

export async function getFollow(creatorId: string): Promise<FollowRecord | undefined> {
  const row = await getDb().getFirstAsync<Row>(
    'SELECT creator_id, followed_at, auto_pin_count FROM creator_follows WHERE creator_id = ?',
    [creatorId],
  )
  return row ? rowToRecord(row) : undefined
}

export async function getAllFollows(): Promise<FollowRecord[]> {
  const rows = await getDb().getAllAsync<Row>(
    'SELECT creator_id, followed_at, auto_pin_count FROM creator_follows ORDER BY followed_at ASC',
  )
  return rows.map(rowToRecord)
}

export async function setAutoPinCount(creatorId: string, count: number): Promise<void> {
  await getDb().runAsync('UPDATE creator_follows SET auto_pin_count = ? WHERE creator_id = ?', [
    count,
    creatorId,
  ])
}
