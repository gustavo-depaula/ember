import { canonicalize, getEntry } from '@/content/contentIndex'

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

/**
 * A plan practice kept under the former id of a practice merged into another
 * (Gospel of the Day into the Daily Liturgy) is folded into the one it became,
 * slots, completions and all. The corpus keeps the former id as an alias, so an
 * app that never runs this still opens it. Runs whenever the catalog loads, as
 * a merge can come with any corpus; once folded the former id is gone from the
 * plan, so it writes nothing again, and a second device's fold of the same
 * practice finds nothing left to move.
 */
export async function foldMergedPractices(): Promise<void> {
  const events = [...useEventStore.getState().practices.keys()].flatMap((fromId) => {
    const toId = getEntry(fromId)?.aliasOf
    return toId ? [{ type: 'PracticeMerged' as const, fromId, toId }] : []
  })
  if (events.length > 0) await emitBatch(events)
}
