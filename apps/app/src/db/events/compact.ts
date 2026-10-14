import { bareId } from '@/content/contentIndex'
import type { EmberDb } from '@/db/emberDb'
import { parseSlotKey } from '@/lib/slotKey'
import type { AppEvent, StoredEvent } from './types'

// The plan holds only what its owner added to it. A log written when launch
// filled it with every practice in the corpus — a `PracticeCreated` and a
// switched-off `SlotAdded` each — is brought to that shape here.

/** The practices an event shows its owner took up; undefined for one of launch's placeholders. */
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
      return 'practiceId' in event ? [event.practiceId] : []
  }
}

/** Sequences of the placeholders written for practices never added to the plan nor prayed. */
function placeholderSequences(rows: { sequence: number; event: AppEvent }[]): number[] {
  const kept = new Set<string>()
  const placeholders: { sequence: number; practiceId: string }[] = []
  for (const { sequence, event } of rows) {
    const practices = taken(event)
    if (practices) {
      // A bare id and its canonical twin name one practice.
      for (const id of practices) kept.add(bareId(id))
    } else if ('practiceId' in event) {
      placeholders.push({ sequence, practiceId: event.practiceId })
    }
  }
  return placeholders.filter((p) => !kept.has(bareId(p.practiceId))).map((p) => p.sequence)
}

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
