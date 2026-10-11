import { canonicalize } from '@/content/contentIndex'

import { emitBatch, useEventStore } from './events'

/**
 * The plan keeps a corpus practice under its canonical id ('practice/mass').
 * Adopting a template used to add it under the bare one ('mass'), and a prayer
 * recorded under one id left the other's row open. Each bare one is folded
 * into its canonical id; a practice with no corpus entry keeps its bare id.
 * Run by `straightenPlanOnce`.
 */
export async function canonicalizePracticeIds(): Promise<void> {
  const events = [...useEventStore.getState().practices.keys()].flatMap((fromId) => {
    const toId = fromId.includes('/') ? undefined : canonicalize(fromId, 'practice')
    return toId ? [{ type: 'PracticeMerged' as const, fromId, toId }] : []
  })
  if (events.length > 0) await emitBatch(events)
}
