import type { MemorizationCardState } from './types'

// "Review" = the user has produced at least one line; "new" = mastery 0.
// Drives the 80/20 daily-queue split and the screen's per-card framing.
export function isReviewCard(card: MemorizationCardState): boolean {
  return card.mastery > 0
}

export function isNewCard(card: MemorizationCardState): boolean {
  return card.mastery === 0
}

// Review card is "due today" when its dueAt has reached or passed today's date.
// ISO 8601 date strings (`YYYY-MM-DD`) compare lexicographically == chronologically.
export function isDueOn(card: MemorizationCardState, today: string): boolean {
  return card.dueAt <= today
}
