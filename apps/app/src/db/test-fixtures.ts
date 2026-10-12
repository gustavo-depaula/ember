// Test fixtures for Maestro (via the dev-only /dev/reset route) and the Vitest
// harness (`test/renderApp.tsx`). Do not import from production paths.

import { format, subDays } from 'date-fns'

import { getManifest } from '@/content/resolver'
import { defaultSlotOf } from '@/features/plan-of-life/defaultSlot'
import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { nextId, useEventStore } from './events'
import { emitBatch } from './events/store'
import { getDb } from './instance'
import type { Tier } from './schema'

const wipeSql = `
DELETE FROM events;
DELETE FROM preferences;
DELETE FROM cache;
DELETE FROM sqlite_sequence WHERE name = 'events';
`

export type TestFixtures = {
  now?: string
  enableSlotKeys?: string[]
  language?: string
  /** Days before `now` to fill with completions of the enabled slots, for screens that draw a record. */
  historyDays?: number
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

  // Each joins the plan as it would from its own page, under the key given.
  // Serial: a single expo-sqlite connection can't hold
  // two transactions at once.
  for (const slotKey of fixtures.enableSlotKeys ?? []) {
    const { practiceId, slotId } = parseSlotKey(slotKey)
    const manifest = getManifest(practiceId)
    const schedule = manifest?.defaults?.slots?.[0]?.schedule
    await addSlotUnderKey({ id: practiceId, activeVariant: practiceId }, slotId, {
      ...defaultSlotOf(manifest),
      schedule: schedule && JSON.stringify(schedule),
    })
  }

  if (fixtures.historyDays && fixtures.enableSlotKeys?.length) {
    await seedHistory(fixtures.enableSlotKeys, fixtures.historyDays, fixtures.now)
  }

  // Force a known locale so accessibility-label assertions are stable
  // regardless of the host machine's preferred language.
  usePreferencesStore.getState().setLanguage(fixtures.language ?? 'en-US')

  usePreferencesStore.getState().setTimeTravelDate(fixtures.now)
}

// A kept rule with the odd lapse: every slot on most days, a deterministic
// one in seven missed, so the record looks lived-in and is the same each run.
async function seedHistory(slotKeys: string[], days: number, now?: string): Promise<void> {
  const db = getDb()
  const end = now ? new Date(`${now}T12:00:00`) : new Date()
  const events = slotKeys.map((slotKey, slotIndex) => {
    const { practiceId, slotId } = parseSlotKey(slotKey)
    const entries = Array.from({ length: days }, (_, i) => i + 1)
      .filter((back) => (back * 3 + slotIndex * 5) % 7 !== 0)
      .map((back) => {
        const day = subDays(end, back)
        return {
          completionId: nextId(),
          date: format(day, 'yyyy-MM-dd'),
          subId: slotId,
          completedAt: day.getTime(),
        }
      })
    return { type: 'CompletionsBatchLogged' as const, practiceId, entries }
  })
  await emitBatch(events)
  // The record reads the rule's history from event timestamps, and the reset
  // has only just written the rule: move it to before the first seeded day, or
  // every completion counts as prayed outside any rule.
  await db.runAsync(
    "UPDATE events SET timestamp = ? WHERE type IN ('PracticeCreated', 'SlotAdded', 'SlotUpdated')",
    [subDays(end, days + 1).getTime()],
  )
}

/**
 * A practice's slot under a key the caller chooses, where the app would give
 * it one of its own: for a flow that taps a known row, and for a test of a log
 * whose slots were still numbered.
 */
export async function addSlotUnderKey(
  practice: { id: string; customName?: string; customIcon?: string; activeVariant?: string },
  slotId: string,
  slot: { tier?: Tier; time?: string; schedule?: string; sortOrder?: number } = {},
): Promise<string> {
  const { practices, slots } = useEventStore.getState()
  const slotKey = composeSlotKey(practice.id, slotId)
  const time = slot.time ?? null
  await emitBatch([
    ...(practices.has(practice.id)
      ? []
      : [
          {
            type: 'PracticeCreated' as const,
            practiceId: practice.id,
            customName: practice.customName,
            customIcon: practice.customIcon,
            activeVariant: practice.activeVariant,
          },
        ]),
    {
      type: 'SlotAdded' as const,
      practiceId: practice.id,
      slotKey,
      tier: slot.tier ?? 'ideal',
      time,
      timeBlock: deriveTimeBlock(time),
      schedule: slot.schedule ?? '{"type":"daily"}',
      sortOrder: slot.sortOrder ?? slots.size + 1,
      enabled: 1,
    },
  ])
  return slotKey
}
