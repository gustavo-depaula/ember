import type { MemorizationCardState, Mode } from './types'

// Strict alternation in the middle range (v1); probabilistic weighting deferred to v1.1.
// Once the user has cleanly recited the whole portion in Cold mode twice, Cold becomes
// the dominant mode — modeling the spec's "alternate Letters/Cold for ~2 successful
// exposures, then Cold becomes dominant".
export function pickMode(card: MemorizationCardState): Mode {
  if (card.mastery < 2) return 'cued'

  if (card.mastery < card.totalLines) {
    return card.lastMode === 'cued' ? 'letters' : 'cued'
  }

  // mastery === totalLines
  if (card.coldSuccesses >= 2) return 'cold'
  return card.lastMode === 'cold' ? 'letters' : 'cold'
}
