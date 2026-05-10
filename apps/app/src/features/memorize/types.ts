import type { ContentLanguage } from '@ember/content-engine'

import type { LocalizedText } from '@/content/types'

export type Mode = 'cued' | 'letters' | 'cold'

// One row per (prayerId, language, portionIndex). Holds SM-2 state plus the
// alternation/first-cold tracking the modes module needs.
export type MemorizationCardState = {
  prayerId: string
  language: ContentLanguage
  portionIndex: number
  totalLines: number
  mastery: number // 0..totalLines — furthest line correctly produced so far in the highest-cue mode reached
  ease: number // SM-2 ease, bounded [1.3, 3.0]
  intervalDays: number // SM-2 interval; 0 means "never reviewed successfully"
  dueAt: string // ISO date YYYY-MM-DD
  lastSeenAt: number | null // ms timestamp of the last review
  lastMode: Mode | null
  coldSuccesses: number // count of clean Cold reviews (K === totalLines); resets on Cold regression
  hasFirstColdBonus: boolean // sticky once awarded; prevents re-bumping ease on later Cold mastery
  createdAt: number
}

export type ResolvedPortion = {
  lines: string[]
  label: LocalizedText | undefined
  startLine: number // 1-indexed inclusive
  endLine: number // 1-indexed inclusive
}

// Shared shape for the three card-mode components. `mastery` is only read by
// CuedCard but kept on every variant so the screen-level dispatcher can hand
// the same props to whichever card pickMode chose.
export type MemorizeCardProps = {
  title: string
  portionLabel?: string
  lines: string[]
  mastery: number
  onOutcome: (outcome: ReviewOutcome) => void
}

// Outcome shapes — discriminated by `kind`. The outer `mode` records which
// mode the card was reviewed in (drives mode-alternation and Cold bonus).
export type CuedOutcome = { mode: 'cued'; kind: 'cued'; result: 'got-it' | 'missed-it' }
export type TapOutcome = {
  mode: 'letters' | 'cold'
  kind: 'tap'
  tappedLine: number // 0 means "tap-nothing" (couldn't get past the cue)
}
export type ReviewOutcome = CuedOutcome | TapOutcome
