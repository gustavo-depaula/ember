import type { Movement } from '@/db/events/state'

export function findExpiredIntentionIds(movements: Map<string, Movement>, now: number): string[] {
  const ids: string[] = []
  for (const m of movements.values()) {
    if (
      m.kind === 'intention' &&
      m.state === 'active' &&
      m.cadence === 'bounded' &&
      m.bounded_until !== undefined &&
      m.bounded_until <= now
    ) {
      ids.push(m.id)
    }
  }
  return ids
}
