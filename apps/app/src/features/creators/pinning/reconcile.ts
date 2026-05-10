/**
 * Pure auto-pin reconciler. Given the most-recent items for a creator, the
 * currently auto-pinned set, and a target N, computes the (toPin, toUnpin)
 * deltas. Idempotent — survives RSS shuffles, missed refreshes, and clock
 * skew. Manual pins are *not* in the auto-pinned set the caller passes in,
 * so this never touches them.
 */

export type RecentItem = { itemId: string }

export function computeReconcile(
  recentByPublishedDesc: RecentItem[],
  currentlyAutoPinned: ReadonlySet<string>,
  autoPinCount: number,
): { toPin: string[]; toUnpin: string[] } {
  const target = new Set(
    recentByPublishedDesc.slice(0, Math.max(0, autoPinCount)).map((i) => i.itemId),
  )
  const toPin = [...target].filter((id) => !currentlyAutoPinned.has(id))
  const toUnpin = [...currentlyAutoPinned].filter((id) => !target.has(id))
  return { toPin, toUnpin }
}
