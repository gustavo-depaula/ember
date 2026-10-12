/**
 * The user's library shelf: saving is a ref + timestamp, separate from offline
 * availability (`features/pinning`). `kind` is denormalized from the catalog
 * entry so the Library can group shelves without a lookup and so user
 * collections (`usercollection/<id>`, no catalog entry) can be saved too.
 */

import { emit, useEventStore } from '../events'
import type { SavedItem } from '../schema'

export type { SavedItem }

// Most recently saved first; the shelf's own order breaks a tie between items
// saved in the same millisecond.
export async function getSavedItems(): Promise<SavedItem[]> {
  return [...useEventStore.getState().savedItems.values()]
    .reverse()
    .sort((a, b) => b.savedAt - a.savedAt)
}

export async function getSavedItemsByKind(kind: string): Promise<SavedItem[]> {
  return (await getSavedItems()).filter((item) => item.kind === kind)
}

export async function isItemSaved(itemId: string): Promise<boolean> {
  return useEventStore.getState().savedItems.has(itemId)
}

export async function getSavedItemIds(): Promise<Set<string>> {
  return new Set(useEventStore.getState().savedItems.keys())
}

export async function saveItem(itemId: string, kind: string): Promise<void> {
  if (useEventStore.getState().savedItems.has(itemId)) return
  await emit({ type: 'ItemSaved', itemId, kind, savedAt: Date.now() })
}

export async function unsaveItem(itemId: string): Promise<void> {
  if (!useEventStore.getState().savedItems.has(itemId)) return
  await emit({ type: 'ItemUnsaved', itemId })
}
