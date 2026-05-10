// Maestro/E2E test fixtures. Only loaded by the dev-only /dev/reset route
// — see apps/app/src/app/dev/reset.tsx. Do not import from production paths.

import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useEventStore } from './events'
import { emitBatch } from './events/store'
import { getDb } from './instance'
import { seedCursors, seedPractices } from './seed'

const wipeSql = `
DELETE FROM events;
DELETE FROM user_practices;
DELETE FROM user_practice_slots;
DELETE FROM completions;
DELETE FROM cursors;
DELETE FROM preferences;
DELETE FROM cache;
DELETE FROM cached_translations;
DELETE FROM sqlite_sequence WHERE name IN (
  'events', 'completions'
);
`

export type TestFixtures = {
  now?: string
  enableSlotKeys?: string[]
}

export async function resetForTests(fixtures: TestFixtures = {}): Promise<void> {
  const db = getDb()

  // `execAsync` opens its own implicit transaction for multi-statement SQL in
  // expo-sqlite 55, so we can't wrap it in `withTransactionAsync` ("cannot
  // start a transaction within a transaction"). Calling it directly is fine —
  // partial-wipe atomicity doesn't matter for a test reset.
  await db.execAsync(wipeSql)

  useEventStore.getState().reset()
  // Re-hydrate to defaults from the (now empty) preferences table — flipping
  // `hydrated: false` without re-running `hydrate()` strands the boot gate
  // since `_layout.tsx` waits on these flags before rendering.
  await Promise.all([useBibleStore.getState().hydrate(), useCatechismStore.getState().hydrate()])

  // Serial: each seed call ends up in `emitBatch` -> `withTransactionAsync`,
  // and a single expo-sqlite connection can't hold two transactions at once.
  await seedPractices()
  await seedCursors()

  if (fixtures.enableSlotKeys?.length) {
    await emitBatch(
      fixtures.enableSlotKeys.map((slotKey) => ({
        type: 'SlotUpdated' as const,
        slotKey,
        changes: { enabled: 1 },
      })),
    )
  }

  // Force a known locale so accessibility-label assertions are stable
  // regardless of the host machine's preferred language.
  usePreferencesStore.getState().setLanguage('en-US')

  usePreferencesStore.getState().setTimeTravelDate(fixtures.now)
}
