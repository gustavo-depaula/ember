import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, replayAll } from '@/db/events'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import {
  addItemToCollection,
  createUserCollection,
  deleteUserCollection,
  getCollectionsContainingRef,
  getUserCollection,
  getUserCollectionItems,
  getUserCollections,
  removeItemFromCollection,
  renameUserCollection,
  reorderCollectionItems,
} from '@/db/repositories/userCollections'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

import { buildUserCollectionManifest } from '../userCollectionManifest'

async function boot() {
  resetAllTestDbs()
  const db = await openDatabaseAsync('ember.db')
  setDb(db as never)
  await db.execAsync(initialMigration)
  await createEventsTable(db as never)
  await replayAll()
}

beforeEach(async () => {
  await boot()
})

afterEach(async () => {
  resetAllTestDbs()
})

describe('user_collections repository', () => {
  it('creates, renames, and deletes a collection', async () => {
    const id = await createUserCollection({ name: 'My Lent', coverTone: 2 })
    let coll = await getUserCollection(id)
    expect(coll?.name).toBe('My Lent')
    expect(coll?.coverTone).toBe(2)

    await renameUserCollection(id, 'Holy Week')
    coll = await getUserCollection(id)
    expect(coll?.name).toBe('Holy Week')

    await deleteUserCollection(id)
    expect(await getUserCollection(id)).toBeUndefined()
  })

  it('adds, orders, reorders, and removes members', async () => {
    const id = await createUserCollection({ name: 'Devotions' })
    await addItemToCollection(id, 'practice/a')
    await addItemToCollection(id, 'practice/b')
    await addItemToCollection(id, 'practice/c')

    let items = await getUserCollectionItems(id)
    expect(items.map((i) => i.ref)).toEqual(['practice/a', 'practice/b', 'practice/c'])

    await reorderCollectionItems(id, ['practice/c', 'practice/a', 'practice/b'])
    items = await getUserCollectionItems(id)
    expect(items.map((i) => i.ref)).toEqual(['practice/c', 'practice/a', 'practice/b'])

    await removeItemFromCollection(id, 'practice/a')
    items = await getUserCollectionItems(id)
    expect(items.map((i) => i.ref)).toEqual(['practice/c', 'practice/b'])
  })

  it('adding the same ref twice is idempotent', async () => {
    const id = await createUserCollection({ name: 'X' })
    await addItemToCollection(id, 'book/x')
    await addItemToCollection(id, 'book/x')
    expect(await getUserCollectionItems(id)).toHaveLength(1)
  })

  it('reverse-indexes which collections contain a ref', async () => {
    const a = await createUserCollection({ name: 'A' })
    const b = await createUserCollection({ name: 'B' })
    await addItemToCollection(a, 'prayer/x')
    await addItemToCollection(b, 'prayer/x')
    const containing = await getCollectionsContainingRef('prayer/x')
    expect(new Set(containing)).toEqual(new Set([a, b]))
  })

  it('deleting a collection cascades its members', async () => {
    const id = await createUserCollection({ name: 'Temp' })
    await addItemToCollection(id, 'book/y')
    await deleteUserCollection(id)
    expect(await getUserCollectionItems(id)).toHaveLength(0)
    expect(await getCollectionsContainingRef('book/y')).toHaveLength(0)
  })

  it('lists collections most-recently-updated first', async () => {
    const a = await createUserCollection({ name: 'A' })
    const b = await createUserCollection({ name: 'B' })
    // Touch A by adding an item so its updated_at moves ahead of B.
    await addItemToCollection(a, 'book/z')
    const list = await getUserCollections()
    expect(list[0].id).toBe(a)
    expect(list.map((c) => c.id).sort()).toEqual([a, b].sort())
  })
})

describe('buildUserCollectionManifest', () => {
  it('produces a single default section of item blocks matching the refs', () => {
    const manifest = buildUserCollectionManifest(
      {
        id: 'abc',
        name: 'My Collection',
        description: 'notes',
        coverTone: 0,
        createdAt: 1,
        updatedAt: 2,
      },
      [
        { collectionId: 'abc', ref: 'practice/a', sectionId: 'default', position: 0, addedAt: 1 },
        { collectionId: 'abc', ref: 'book/b', sectionId: 'default', position: 1, addedAt: 2 },
      ],
    )

    expect(manifest.id).toBe('usercollection/abc')
    expect(manifest.name).toEqual({ 'en-US': 'My Collection' })
    expect(manifest.sections).toHaveLength(1)
    expect(manifest.sections[0].id).toBe('default')
    expect(manifest.sections[0].title).toEqual({ 'en-US': '' })
    expect(manifest.sections[0].blocks).toEqual([
      { kind: 'item', ref: 'practice/a', label: undefined },
      { kind: 'item', ref: 'book/b', label: undefined },
    ])
  })
})
