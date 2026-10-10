import type { EmberDb } from '@/lib/db-shared/protocol'
import { parseSlotKey } from '@/lib/slotKey'
import type { AppEvent, StoredEvent } from './types'

// Launch used to write a `PracticeCreated` and a switched-off `SlotAdded` for
// every practice in the corpus, so a log could hold hundreds of events its
// owner never caused. The plan now holds only what was added to it, and a log
// from before is brought to the same shape here.

/** A bare id and its canonical twin name one practice. */
function bothIds(practiceId: string): string[] {
  return practiceId.includes('/') ? [practiceId] : [practiceId, `practice/${practiceId}`]
}

/** The practices an event shows its owner took up, or undefined for the placeholders launch wrote. */
function taken(event: AppEvent): string[] | undefined {
  switch (event.type) {
    case 'PracticeCreated':
      return undefined
    case 'SlotAdded':
      return event.enabled ? [event.practiceId] : undefined
    case 'SlotUpdated':
      return [parseSlotKey(event.slotKey).practiceId]
    case 'PracticeMerged':
      return [event.fromId, event.toId]
    // The plan's order names every slot, the untouched ones among them.
    case 'SlotsReordered':
      return []
    default:
      return 'practiceId' in event ? bothIds(event.practiceId) : []
  }
}

/** Sequences of the placeholders written for practices never added to the plan nor prayed. */
export function placeholderSequences(rows: { sequence: number; event: AppEvent }[]): number[] {
  const kept = new Set<string>()
  const placeholders: { sequence: number; practiceId: string }[] = []
  for (const { sequence, event } of rows) {
    const practices = taken(event)
    if (practices) {
      for (const id of practices) kept.add(id)
    } else if ('practiceId' in event) {
      placeholders.push({ sequence, practiceId: event.practiceId })
    }
  }
  return placeholders.filter((p) => !kept.has(p.practiceId)).map((p) => p.sequence)
}

/** Run before the first replay, so the store never holds what is dropped. */
export async function dropPlaceholders(db: EmberDb): Promise<void> {
  const rows = await db.getAllAsync<StoredEvent>('SELECT * FROM events ORDER BY sequence')
  const sequences = placeholderSequences(
    rows.map((row) => ({ sequence: row.sequence, event: JSON.parse(row.payload) as AppEvent })),
  )
  if (sequences.length === 0) return
  await db.runAsync('DELETE FROM events WHERE sequence IN (SELECT value FROM json_each(?))', [
    JSON.stringify(sequences),
  ])
}
