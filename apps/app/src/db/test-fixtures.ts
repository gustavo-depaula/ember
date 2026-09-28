// Test fixtures for Maestro (via the dev-only /dev/reset route) and the Vitest
// harness (`test/renderApp.tsx`). Do not import from production paths.

import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useEventStore } from './events'
import { emitBatch } from './events/store'
import { getDb } from './instance'
import { seedCursors, seedPractices } from './seed'

const wipeSql = `
DELETE FROM events;
DELETE FROM preferences;
DELETE FROM cache;
DELETE FROM sqlite_sequence WHERE name = 'events';
`

export type TestFixtures = {
  now?: string
  enableSlotKeys?: string[]
}

export async function resetForTests(fixtures: TestFixtures = {}): Promise<void> {
  const db = getDb()

  // expo-sqlite 55's `execAsync` opens its own implicit transaction for
  // multi-statement SQL, so it can't be wrapped in `withTransactionAsync`
  // ("cannot start a transaction within a transaction"). A test reset doesn't
  // need the wipe to be atomic.
  await db.execAsync(wipeSql)

  useEventStore.getState().reset()
  // Re-hydrate to defaults from the (now empty) preferences table — flipping
  // `hydrated: false` without re-running `hydrate()` strands the boot gate
  // since `_layout.tsx` waits on these flags before rendering.
  await useBibleStore.getState().hydrate()

  // Serial: each seed call ends up in `emitBatch` -> `runBatchInTx`, and a
  // single expo-sqlite connection can't hold two transactions at once.
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
