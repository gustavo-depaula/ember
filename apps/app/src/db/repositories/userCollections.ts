/**
 * User-collections repository — collections the user authors locally. They
 * serialize to the same `CollectionItemManifest` as corpus collections and
 * render through the same viewer; only storage + authoring live here.
 *
 * A collection is its metadata (`user_collections`) plus an ordered list of
 * member refs (`user_collection_items`). v1 keeps every member in one implicit
 * `'default'` section, but `section_id` leaves room for multi-section authoring.
 */

import { broadcastChange } from '@/lib/db-shared/manager'
import { randomId } from '@/lib/id'
import { getDb } from '../client'

export const defaultSectionId = 'default'

export type UserCollection = {
  id: string
  name: string
  description?: string
  coverTone: number
  createdAt: number
  updatedAt: number
}

export type UserCollectionItem = {
  collectionId: string
  ref: string
  sectionId: string
  label?: string
  position: number
  addedAt: number
}

type CollectionRow = {
  id: string
  name: string
  description: string | null
  cover_tone: number
  created_at: number
  updated_at: number
}

type ItemRow = {
  collection_id: string
  ref: string
  section_id: string
  label: string | null
  position: number
  added_at: number
}

function rowToCollection(row: CollectionRow): UserCollection {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    coverTone: row.cover_tone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToItem(row: ItemRow): UserCollectionItem {
  return {
    collectionId: row.collection_id,
    ref: row.ref,
    sectionId: row.section_id,
    label: row.label ?? undefined,
    position: row.position,
    addedAt: row.added_at,
  }
}

function touch(id: string): Promise<unknown> {
  return getDb().runAsync('UPDATE user_collections SET updated_at = ? WHERE id = ?', [
    Date.now(),
    id,
  ])
}

function notify(): void {
  broadcastChange({ kind: 'invalidate', tags: ['user-collections'] })
}

export async function createUserCollection(input: {
  name: string
  description?: string
  coverTone?: number
}): Promise<string> {
  const id = randomId()
  const now = Date.now()
  await getDb().runAsync(
    'INSERT INTO user_collections (id, name, description, cover_tone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, input.name, input.description ?? null, input.coverTone ?? 0, now, now],
  )
  notify()
  return id
}

export async function renameUserCollection(
  id: string,
  name: string,
  description?: string,
): Promise<void> {
  await getDb().runAsync(
    'UPDATE user_collections SET name = ?, description = ?, updated_at = ? WHERE id = ?',
    [name, description ?? null, Date.now(), id],
  )
  notify()
}

export async function setUserCollectionTone(id: string, coverTone: number): Promise<void> {
  await getDb().runAsync(
    'UPDATE user_collections SET cover_tone = ?, updated_at = ? WHERE id = ?',
    [coverTone, Date.now(), id],
  )
  notify()
}

export async function deleteUserCollection(id: string): Promise<void> {
  // Delete members explicitly so this holds whether or not FK cascade is on.
  await getDb().runBatchInTx([
    { sql: 'DELETE FROM user_collection_items WHERE collection_id = ?', params: [id] },
    { sql: 'DELETE FROM user_collections WHERE id = ?', params: [id] },
  ])
  notify()
}

export async function getUserCollection(id: string): Promise<UserCollection | undefined> {
  const row = await getDb().getFirstAsync<CollectionRow>(
    'SELECT id, name, description, cover_tone, created_at, updated_at FROM user_collections WHERE id = ?',
    [id],
  )
  return row ? rowToCollection(row) : undefined
}

export async function getUserCollections(): Promise<UserCollection[]> {
  const rows = await getDb().getAllAsync<CollectionRow>(
    'SELECT id, name, description, cover_tone, created_at, updated_at FROM user_collections ORDER BY updated_at DESC',
  )
  return rows.map(rowToCollection)
}

export async function getUserCollectionItems(id: string): Promise<UserCollectionItem[]> {
  const rows = await getDb().getAllAsync<ItemRow>(
    'SELECT collection_id, ref, section_id, label, position, added_at FROM user_collection_items WHERE collection_id = ? ORDER BY section_id, position',
    [id],
  )
  return rows.map(rowToItem)
}

export async function addItemToCollection(id: string, ref: string): Promise<void> {
  // Position is the next free slot, computed inline; insert + touch run as one
  // transaction so a member never lands without bumping the collection's clock.
  await getDb().runBatchInTx([
    {
      sql: `INSERT INTO user_collection_items (collection_id, ref, section_id, label, position, added_at)
            VALUES (?, ?, ?, NULL,
              (SELECT COALESCE(MAX(position), -1) + 1 FROM user_collection_items WHERE collection_id = ? AND section_id = ?),
              ?)
            ON CONFLICT (collection_id, ref, section_id) DO NOTHING`,
      params: [id, ref, defaultSectionId, id, defaultSectionId, Date.now()],
    },
    { sql: 'UPDATE user_collections SET updated_at = ? WHERE id = ?', params: [Date.now(), id] },
  ])
  notify()
}

export async function removeItemFromCollection(id: string, ref: string): Promise<void> {
  await getDb().runAsync(
    'DELETE FROM user_collection_items WHERE collection_id = ? AND ref = ? AND section_id = ?',
    [id, ref, defaultSectionId],
  )
  await touch(id)
  notify()
}

/** Rewrite member positions to match `orderedRefs`, in a single transaction. */
export async function reorderCollectionItems(id: string, orderedRefs: string[]): Promise<void> {
  const statements = orderedRefs.map((ref, position) => ({
    sql: 'UPDATE user_collection_items SET position = ? WHERE collection_id = ? AND ref = ? AND section_id = ?',
    params: [position, id, ref, defaultSectionId] as (string | number)[],
  }))
  statements.push({
    sql: 'UPDATE user_collections SET updated_at = ? WHERE id = ?',
    params: [Date.now(), id],
  })
  await getDb().runBatchInTx(statements)
  notify()
}

/** Collection ids whose members include `ref` — drives the Add-to-collection checks. */
export async function getCollectionsContainingRef(ref: string): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ collection_id: string }>(
    'SELECT DISTINCT collection_id FROM user_collection_items WHERE ref = ?',
    [ref],
  )
  return rows.map((r) => r.collection_id)
}
