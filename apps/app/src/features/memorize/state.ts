import type { ContentLanguage } from '@ember/content-engine'
import { addDays, format, parseISO } from 'date-fns'

import type { MemorizationCardState, ReviewOutcome } from './types'

const EASE_MIN = 1.3
const EASE_MAX = 3.0
const EASE_INITIAL = 2.5
const EASE_DROP = 0.2
const COLD_BONUS = 0.15
const FAILURE_INTERVAL_DAYS = 1
const TAP_NOTHING_FLOOR_MASTERY = 1

export function initialCard(args: {
  prayerId: string
  language: ContentLanguage
  portionIndex: number
  totalLines: number
  createdAt: number
  today: string
}): MemorizationCardState {
  return {
    prayerId: args.prayerId,
    language: args.language,
    portionIndex: args.portionIndex,
    totalLines: args.totalLines,
    mastery: 0,
    ease: EASE_INITIAL,
    intervalDays: 0,
    dueAt: args.today,
    lastSeenAt: null,
    lastMode: null,
    coldSuccesses: 0,
    hasFirstColdBonus: false,
    createdAt: args.createdAt,
  }
}

// Pure SM-2 grading. `now` and `today` are passed in (no clock) so this is
// deterministic during event replay.
export function applyOutcome(
  card: MemorizationCardState,
  outcome: ReviewOutcome,
  ctx: { now: number; today: string },
): MemorizationCardState {
  let mastery = card.mastery
  let ease = card.ease
  let success = false

  if (outcome.kind === 'cued') {
    if (outcome.result === 'got-it') {
      mastery = Math.min(card.totalLines, card.mastery + 1)
      success = true
    } else {
      ease = clampEase(ease - EASE_DROP)
    }
  } else if (outcome.tappedLine === 0) {
    // tap-nothing: floor mastery at 1, never reset to 0
    mastery = TAP_NOTHING_FLOOR_MASTERY
    ease = clampEase(ease - EASE_DROP)
  } else {
    mastery = outcome.tappedLine
    if (outcome.tappedLine < card.mastery) {
      ease = clampEase(ease - EASE_DROP)
    } else {
      success = true
    }
  }

  let coldSuccesses = card.coldSuccesses
  let hasFirstColdBonus = card.hasFirstColdBonus
  if (outcome.mode === 'cold' && outcome.kind === 'tap') {
    if (outcome.tappedLine === card.totalLines) {
      coldSuccesses = card.coldSuccesses + 1
      if (!hasFirstColdBonus) {
        ease = clampEase(ease + COLD_BONUS)
        hasFirstColdBonus = true
      }
    } else {
      coldSuccesses = 0
    }
  }

  const intervalDays = success ? Math.max(1, card.intervalDays * ease) : FAILURE_INTERVAL_DAYS

  return {
    ...card,
    mastery,
    ease,
    intervalDays,
    dueAt: format(addDays(parseISO(ctx.today), Math.ceil(intervalDays)), 'yyyy-MM-dd'),
    lastSeenAt: ctx.now,
    lastMode: outcome.mode,
    coldSuccesses,
    hasFirstColdBonus,
  }
}

function clampEase(value: number): number {
  if (value < EASE_MIN) return EASE_MIN
  if (value > EASE_MAX) return EASE_MAX
  return value
}
