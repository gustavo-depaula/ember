import type { Resolution, ResolutionReview } from '@/db/events'

export type ResolutionProgress = {
  kept: number
  total: number
  label: string
}

export function resolutionProgress(
  _resolution: Resolution,
  reviews: ResolutionReview[],
): ResolutionProgress {
  const checkins = reviews.filter((r) => r.kind === 'checkin' || r.kind === 'review')
  const keptCount = checkins.filter((r) => r.outcome === 'kept').length
  return {
    kept: keptCount > 0 ? 1 : 0,
    total: 1,
    label: keptCount > 0 ? '✓' : '·',
  }
}
