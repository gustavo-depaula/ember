import type { Resolution, ResolutionReview } from '@/db/events'

export function pickActive(
  resolutions: Map<string, Resolution>,
  ids: Set<string> | undefined,
  now: number,
): Resolution | undefined {
  if (!ids) return undefined
  let best: Resolution | undefined
  for (const id of ids) {
    const r = resolutions.get(id)
    if (!r || r.archived_at !== undefined) continue
    if (now < r.starts_at || now > r.ends_at) continue
    if (!best || r.recorded_at > best.recorded_at) best = r
  }
  return best
}

export function pickPending(
  resolutions: Map<string, Resolution>,
  reviews: Map<string, ResolutionReview[]>,
  ids: Set<string> | undefined,
  now: number,
): Resolution | undefined {
  if (!ids) return undefined
  let active: Resolution | undefined
  let mostRecentExpired: Resolution | undefined
  for (const id of ids) {
    const r = resolutions.get(id)
    if (!r || r.archived_at !== undefined) continue
    const list = reviews.get(r.id)
    if (list?.some((x) => x.kind === 'review')) continue
    if (now < r.starts_at) continue
    if (now <= r.ends_at) {
      if (!active || r.recorded_at > active.recorded_at) active = r
    } else if (!mostRecentExpired || r.ends_at > mostRecentExpired.ends_at) {
      mostRecentExpired = r
    }
  }
  return active ?? mostRecentExpired
}
