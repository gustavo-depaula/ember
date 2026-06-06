/**
 * Pure helpers for estimating reading pace from a stream of relocate
 * timestamps. The median of recent inter-page intervals (capped at 5 min so
 * pauses don't pollute the rate) gives a stable estimate that doesn't jitter
 * on the next page turn.
 */

const PAUSE_THRESHOLD_MS = 5 * 60_000
const RECENT_WINDOW = 20
// Number of intervals (= turn pairs) we need before publishing an estimate.
const MIN_INTERVAL_SAMPLES = 3

export type PageTurn = { at: number }

/** Returns minutes-per-page, or undefined if we don't have enough samples. */
export function estimateMinutesPerPage(turns: PageTurn[]): number | undefined {
  if (turns.length < 2) return undefined
  const intervals: number[] = []
  const recent = turns.slice(-RECENT_WINDOW)
  for (let i = 1; i < recent.length; i++) {
    const dt = recent[i].at - recent[i - 1].at
    if (dt > 0 && dt < PAUSE_THRESHOLD_MS) intervals.push(dt / 60_000)
  }
  if (intervals.length < MIN_INTERVAL_SAMPLES) return undefined
  intervals.sort((a, b) => a - b)
  return intervals[Math.floor(intervals.length / 2)]
}

/** Append a turn, dropping older entries beyond the recent window. */
export function appendTurn(turns: PageTurn[], at: number): PageTurn[] {
  const next = turns.length >= RECENT_WINDOW ? turns.slice(-RECENT_WINDOW + 1) : turns
  return [...next, { at }]
}
