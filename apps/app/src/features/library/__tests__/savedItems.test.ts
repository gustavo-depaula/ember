import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, replayAll } from '@/db/events'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import {
  getSavedItems,
  getSavedItemsByKind,
  isItemSaved,
  saveItem,
  unsaveItem,
} from '@/db/repositories/savedItems'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

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

describe('saved_items repository', () => {
  it('saves, reads, and unsaves an item', async () => {
    expect(await isItemSaved('book/x')).toBe(false)
    await saveItem('book/x', 'book')
    expect(await isItemSaved('book/x')).toBe(true)

    const all = await getSavedItems()
    expect(all.map((s) => s.itemId)).toEqual(['book/x'])
    expect(all[0].kind).toBe('book')

    await unsaveItem('book/x')
    expect(await isItemSaved('book/x')).toBe(false)
  })

  it('saving the same item twice is idempotent', async () => {
    await saveItem('practice/rosary', 'practice')
    await saveItem('practice/rosary', 'practice')
    const all = await getSavedItems()
    expect(all).toHaveLength(1)
  })

  it('groups by kind, most-recent first', async () => {
    await saveItem('book/a', 'book')
    await saveItem('practice/p', 'practice')
    await saveItem('book/b', 'book')

    const books = await getSavedItemsByKind('book')
    expect(books.map((s) => s.itemId)).toEqual(['book/b', 'book/a'])

    const prayers = await getSavedItemsByKind('practice')
    expect(prayers.map((s) => s.itemId)).toEqual(['practice/p'])
  })
})
