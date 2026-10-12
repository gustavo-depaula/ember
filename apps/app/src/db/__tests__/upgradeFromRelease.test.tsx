/**
 * The database a released install holds — the catalogue's ~800 placeholders,
 * events without ids, numbered completions, the shelf and Bible place in their
 * old tables — opened by this version. The plan and the record have to come
 * out exactly as the user left them, the placeholders gone, and a second
 * launch has to change nothing.
 */
import { Text } from 'tamagui'
import { describe, expect, it } from 'vitest'

import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { createEventsTable, replayAll, useEventStore } from '@/db/events'
import { applyEvent } from '@/db/events/projections'
import { setDb } from '@/db/instance'
import initialMigration from '@/db/migrations/0001_initial.sql'
import { getSavedItems } from '@/db/repositories/savedItems'
import { upgradeLog } from '@/db/upgradeLog'
import { straightenPlanOnce } from '@/features/plan-of-life/straighten'
import { renderApp } from '@/test/renderApp'
import { openDatabaseAsync } from '@/test/sqlite-better'

const releasedTables = `
CREATE TABLE events (
  sequence  INTEGER PRIMARY KEY AUTOINCREMENT,
  type      TEXT NOT NULL,
  payload   TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  version   INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE saved_items (item_id TEXT PRIMARY KEY, kind TEXT NOT NULL, saved_at INTEGER NOT NULL);
INSERT INTO saved_items VALUES ('book/imitation', 'book', 100);
INSERT INTO preferences VALUES ('translation', 'DRB'), ('theme', 'dark'), ('bible-book', 'john'), ('bible-chapter', '6');
`

type Loose = { type: string } & Record<string, unknown>

// What every launch of the released app wrote for each practice in the corpus.
function placeholders(): Loose[] {
  return getAllManifests()
    .filter((m) => m.defaults?.slots?.length && !isAlternateForm(m))
    .flatMap((m) => [
      { type: 'PracticeCreated', practiceId: m.id, activeVariant: m.id },
      {
        type: 'SlotAdded',
        practiceId: m.id,
        slotKey: `${m.id}::1`,
        tier: 'extra',
        time: null,
        timeBlock: 'flexible',
        schedule: '{"type":"daily"}',
        sortOrder: m.defaults?.sortOrder ?? 0,
        enabled: 0,
      },
    ])
}

const logged = (completionId: number, practiceId: string, subId: string, date: string) => ({
  type: 'CompletionLogged',
  completionId,
  practiceId,
  subId,
  date,
  completedAt: 1,
  via: 'amen',
})

// A few months of use on top of them.
const use: Loose[] = [
  { type: 'SlotUpdated', slotKey: 'practice/rosary::1', changes: { enabled: 1, time: '07:00' } },
  { type: 'SlotUpdated', slotKey: 'practice/mass::1', changes: { enabled: 1, time: '10:00' } },
  {
    type: 'SlotAdded',
    practiceId: 'practice/mass',
    slotKey: 'practice/mass::2',
    tier: 'ideal',
    time: '19:00',
    timeBlock: 'evening',
    schedule: '{"type":"days-of-week","days":[3]}',
    sortOrder: 900,
    enabled: 1,
  },
  { type: 'SlotUpdated', slotKey: 'practice/angelus::1', changes: { enabled: 1 } },
  { type: 'SlotUpdated', slotKey: 'practice/angelus::1', changes: { enabled: 0 } },
  logged(1, 'practice/rosary', '1', '2026-05-10'),
  logged(2, 'practice/rosary', '1', '2026-05-11'),
  logged(3, 'practice/mass', '2', '2026-05-13'),
  logged(4, 'practice/mass', '1', '2026-05-17'),
  {
    type: 'CompletionRemoved',
    completionId: 2,
    practiceId: 'practice/rosary',
    date: '2026-05-11',
    subId: '1',
  },
  // Prayed from the library, never added to the plan.
  logged(5, 'practice/jesus-prayer', 'default', '2026-05-12'),
  {
    type: 'CursorSet',
    cursorId: 'book/imitation',
    position: '{"index":4}',
    startedAt: '2026-05-01',
  },
]

function plan() {
  const s = useEventStore.getState()
  return {
    inPlan: [...s.slots.values()]
      .filter((slot) => slot.enabled)
      .map((slot) => `${slot.id} ${slot.time} ${slot.schedule}`)
      .sort(),
    takenOut: [...s.slots.values()].filter((slot) => !slot.enabled).map((slot) => slot.id),
    prayed: [...s.completions.values()]
      .map((c) => `${c.practice_id}::${c.sub_id} ${c.date}`)
      .sort(),
    cursor: s.cursors.get('book/imitation')?.position,
  }
}

describe('opening a released install’s database', () => {
  it('keeps the plan and the record, and drops what launch wrote', async () => {
    await renderApp({
      route: '/blank',
      routes: [{ pattern: '/blank', loader: async () => ({ default: () => <Text>blank</Text> }) }],
    })
    const written = [...placeholders(), ...use]
    expect(written.length).toBeGreaterThan(600)

    // What the released app showed: the same events, folded as they were written.
    useEventStore.getState().reset()
    useEventStore.setState((draft) => {
      for (const event of written) applyEvent(draft as never, event as never)
    })
    const before = plan()
    expect(before.inPlan).toHaveLength(3)

    const db = await openDatabaseAsync('released.db')
    await db.execAsync(initialMigration)
    await db.execAsync(releasedTables)
    for (const [i, event] of written.entries()) {
      await db.runAsync('INSERT INTO events (type, payload, timestamp) VALUES (?, ?, ?)', [
        event.type,
        JSON.stringify(event),
        // Launch wrote its placeholders in one batch.
        i < written.length - use.length ? 1000 : 2000 + i,
      ])
    }
    setDb(db as never)

    const open = async () => {
      await createEventsTable(db as never)
      await upgradeLog(db as never)
      await replayAll()
      await straightenPlanOnce()
    }
    await open()

    // Of some four hundred switched-off slots, the two left belong to practices
    // the user took out of the plan or prayed.
    const after = { ...before, takenOut: ['practice/angelus::1', 'practice/jesus-prayer::1'] }
    expect(plan()).toEqual(after)
    expect([...useEventStore.getState().practices.keys()].sort()).toEqual([
      'practice/angelus',
      'practice/jesus-prayer',
      'practice/mass',
      'practice/rosary',
    ])
    expect((await getSavedItems()).map((s) => s.itemId)).toEqual(['book/imitation'])
    expect(useEventStore.getState().cursors.get('bible')?.position).toBe(
      '{"bookId":"john","chapter":6}',
    )

    const count = async () =>
      (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM events'))?.n
    const settled = await count()
    expect(settled).toBeLessThan(40)
    await open()
    expect(await count()).toBe(settled)
    expect(plan()).toEqual(after)
  }, 60_000)
})
