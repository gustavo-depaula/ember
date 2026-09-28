/**
 * How many plan-of-life practices are available offline: pinned directly, or a
 * member of a pinned collection. A collection whose body has not warmed yet
 * contributes nothing — fine for an advisory indicator.
 */

import { getCollectionItems } from '@/content/contentIndex'

type PinnedLike = { id: string }

export type Coverage = {
  total: number
  covered: number
}

export function computePlanCoverage(
  planPracticeIds: Iterable<string>,
  pinned: readonly PinnedLike[],
): Coverage {
  const planIds = new Set<string>()
  for (const id of planPracticeIds) planIds.add(id)
  const total = planIds.size
  if (total === 0) return { total: 0, covered: 0 }

  const offline = new Set<string>()
  for (const item of pinned) {
    if (item.id.startsWith('practice/')) {
      offline.add(item.id)
      continue
    }
    if (item.id.startsWith('collection/')) {
      for (const child of getCollectionItems(item.id)) {
        if (child.ref.startsWith('practice/')) offline.add(child.ref)
      }
    }
  }

  let covered = 0
  for (const id of planIds) {
    if (offline.has(`practice/${id}`)) covered++
  }
  return { total, covered }
}
