import { isNewCard, isReviewCard } from './predicates'
import type { MemorizationCardState } from './types'

const DEFAULT_CAP = 10
const DEFAULT_NEW_RATIO = 0.2

// Build today's review queue. Honors the 80/20 review-to-new allocation per
// the Hafiz tradition: most of the day's session reinforces older material,
// a small slice introduces new content. When the review pool is short, the
// freed slots backfill with extra new cards (the "relaxed cap" rule). When
// both pools are short, the session is naturally shorter — never padded.
export function buildSession({
  allCards,
  today,
  cap = DEFAULT_CAP,
  newRatio = DEFAULT_NEW_RATIO,
}: {
  allCards: MemorizationCardState[]
  today: string
  cap?: number
  newRatio?: number
}): MemorizationCardState[] {
  const reviewCap = cap - Math.floor(cap * newRatio)

  // ISO 8601 dates sort lexicographically == chronologically.
  const review = allCards
    .filter((c) => isReviewCard(c) && c.dueAt <= today)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, reviewCap)

  // Whatever the review pool didn't claim becomes new-card budget.
  const expandedNewCap = cap - review.length
  const fresh = allCards
    .filter(isNewCard)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, expandedNewCap)

  return [...review, ...fresh]
}
