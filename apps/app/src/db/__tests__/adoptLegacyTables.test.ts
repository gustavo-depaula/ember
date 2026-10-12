/**
 * A database from before the shelf, the user's collections and the travelling
 * preferences joined the event log has to open with all of them where they
 * were — same shelf order, same members in the same order, same collection
 * order — and still there after the log alone is replayed, with a device's own
 * preferences left in their table.
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { createEventsTable, replayAll, useEventStore } from '@/db/events'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import { createPracticeWithSlot, getCursor, logCompletion } from '@/db/repositories'
import { getAllPreferences, getPreference, setPreference } from '@/db/repositories/preferences'
import { getSavedItems } from '@/db/repositories/savedItems'
import { getUserCollectionItems, getUserCollections } from '@/db/repositories/userCollections'
import { addSlotUnderKey } from '@/db/test-fixtures'
import { upgradeLog } from '@/db/upgradeLog'
import { openDatabaseAsync, resetAllTestDbs } from '@/test/sqlite-better'

const legacyTables = `
CREATE TABLE saved_items (item_id TEXT PRIMARY KEY, kind TEXT NOT NULL, saved_at INTEGER NOT NULL);
CREATE TABLE user_collections (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  cover_tone INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE user_collection_items (
  collection_id TEXT NOT NULL, ref TEXT NOT NULL, section_id TEXT NOT NULL DEFAULT 'default',
  label TEXT, position INTEGER NOT NULL, added_at INTEGER NOT NULL,
  PRIMARY KEY (collection_id, ref, section_id));
INSERT INTO saved_items VALUES ('book/a', 'book', 100), ('practice/b', 'practice', 300), ('book/c', 'book', 300);
INSERT INTO user_collections VALUES ('lent', 'Lent', 'Forty days', 2, 10, 900), ('advent', 'Advent', NULL, 0, 20, 500);
INSERT INTO user_collection_items VALUES
  ('lent', 'practice/stations', 'default', NULL, 1, 50),
  ('lent', 'practice/rosary', 'default', NULL, 0, 60),
  ('advent', 'practice/angelus', 'default', NULL, 0, 70);
INSERT INTO preferences VALUES ('translation', 'DRB'), ('jurisdiction', 'BR'), ('theme', 'dark'),
  ('mass-times.favorites', '{"c1":{"id":"c1","name":"Sé","city":"São Paulo"}}'),
  ('mass-times.checkins', '[{"id":"k2","churchId":"c1","churchName":"Sé","kind":"mass","at":"2026-05-17T13:00:00.000Z"},{"id":"k1","churchId":"c1","churchName":"Sé","kind":"visit","at":"2026-05-10T13:00:00.000Z"}]'),
  ('bible-book', 'john'), ('bible-chapter', '6'), ('bible-updated-at', '1700000000000'),
  ('bible-places', '[{"bookId":"john","chapter":6}]');
`

async function state() {
  const collections = await getUserCollections()
  return {
    shelf: (await getSavedItems()).map((s) => `${s.itemId} ${s.kind} ${s.savedAt}`),
    collections: collections.map((c) => `${c.name} ${c.description} ${c.coverTone} ${c.updatedAt}`),
    lent: (await getUserCollectionItems('lent')).map((i) => `${i.ref} ${i.addedAt}`),
    preferences: await getAllPreferences(),
    churches: [...useEventStore.getState().favoriteChurches.values()].map((c) => c.name),
    checkIns: [...useEventStore.getState().checkIns.values()].map((c) => `${c.id} ${c.kind}`),
    bible: [getCursor('bible')?.position, getCursor('bible/places')?.position],
  }
}

beforeEach(() => {
  resetAllTestDbs()
  useEventStore.getState().reset()
})

describe('opening a database that kept the shelf and collections in tables', () => {
  it('carries them into the log as they stood and drops the tables', async () => {
    const db = await openDatabaseAsync('ember.db')
    setDb(db as never)
    await db.execAsync(initialMigration)
    await db.execAsync(legacyTables)
    await createEventsTable(db as never)
    await upgradeLog(db as never)

    const adopted = await state()
    expect(adopted).toEqual({
      shelf: ['book/c book 300', 'practice/b practice 300', 'book/a book 100'],
      collections: ['Lent Forty days 2 900', 'Advent undefined 0 500'],
      lent: ['practice/rosary 60', 'practice/stations 50'],
      preferences: { translation: 'DRB', jurisdiction: 'BR', theme: 'dark' },
      churches: ['Sé'],
      checkIns: ['k2 mass', 'k1 visit'],
      bible: [
        '{"bookId":"john","chapter":6,"updatedAt":1700000000000}',
        '[{"bookId":"john","chapter":6}]',
      ],
    })

    await replayAll()
    expect(await state()).toEqual(adopted)
    const left = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE name IN ('saved_items', 'user_collections', 'user_collection_items')",
    )
    expect(left).toEqual([])
    expect(await db.getAllAsync('SELECT key FROM preferences')).toEqual([{ key: 'theme' }])

    // A second launch finds nothing to carry.
    const before = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM events')
    await upgradeLog(db as never)
    expect(await db.getFirstAsync('SELECT COUNT(*) AS n FROM events')).toEqual(before)
    expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({ user_version: 1 })
  })

  it('keeps a travelling preference in the log and a device one in its table', async () => {
    const db = await openDatabaseAsync('ember.db')
    setDb(db as never)
    await db.execAsync(initialMigration)
    await createEventsTable(db as never)

    await setPreference('translation', 'NABRE')
    await setPreference('translation', 'NABRE')
    await setPreference('theme', 'light')

    expect(await db.getAllAsync('SELECT key FROM preferences')).toEqual([{ key: 'theme' }])
    expect(
      await db.getAllAsync("SELECT type FROM events WHERE type = 'PreferenceSet'"),
    ).toHaveLength(1)
    await replayAll()
    expect(await getPreference('translation')).toBe('NABRE')
  })

  it("moves a practice kept under one of launch's own ids to its corpus practice", async () => {
    const db = await openDatabaseAsync('ember.db')
    setDb(db as never)
    await db.execAsync(initialMigration)
    await createEventsTable(db as never)
    await addSlotUnderKey(
      { id: 'three-oclock', customName: "Three O'Clock Prayer", customIcon: 'clock' },
      '1',
      { time: '15:00' },
    )
    await logCompletion('three-oclock', '2026-05-10', '1', 'three-oclock', 'checklist')

    await upgradeLog(db as never)
    await replayAll()

    const { practices, slots, completions } = useEventStore.getState()
    expect([...practices.values()]).toEqual([
      expect.objectContaining({ practice_id: 'practice/three-oclock-prayer', custom_name: null }),
    ])
    expect(slots.get('practice/three-oclock-prayer::1')).toMatchObject({
      time: '15:00',
      enabled: 1,
    })
    expect([...completions.values()].map((c) => c.practice_id)).toEqual([
      'practice/three-oclock-prayer',
    ])
  })
})
