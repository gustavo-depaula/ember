import { isApplicableOn as isCommitmentActiveOn } from '@/features/plan-of-life/schedule'

import type { Commitment, Schedule, ScheduleContext } from './types'

export { isCommitmentActiveOn }

function parseFenceTime(value: string): { hours: number; minutes: number } | undefined {
  const [h, m] = value.split(':')
  const hours = Number.parseInt(h, 10)
  const minutes = Number.parseInt(m, 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined
  return { hours, minutes }
}

function fenceWindow(
  fenceStart: string,
  fenceEnd: string,
  reference: Date,
): { start: Date; end: Date } | undefined {
  const start = parseFenceTime(fenceStart)
  const end = parseFenceTime(fenceEnd)
  if (!start || !end) return undefined

  const startDate = new Date(reference)
  startDate.setHours(start.hours, start.minutes, 0, 0)

  const endDate = new Date(reference)
  endDate.setHours(end.hours, end.minutes, 0, 0)

  // Overnight fence (e.g., 21:00 → 07:00) — end is on the next day.
  if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1)

  return { start: startDate, end: endDate }
}

function isInsideFence(window: { start: Date; end: Date }, now: Date): boolean {
  return now >= window.start && now < window.end
}

export function isFenceActive(
  commitment: Commitment,
  now: Date = new Date(),
  ctx?: ScheduleContext,
): boolean {
  if (commitment.kind !== 'time-fence' || !commitment.fence_start || !commitment.fence_end) {
    return isCommitmentActiveOn(commitment.schedule, now, ctx)
  }
  // Check both today's fence window AND yesterday's overnight tail. An
  // overnight fence (e.g. 21:00 → 07:00) that started yesterday at 21:00 is
  // still active today at 03:00 even though today's 21:00→07:00 window has
  // not yet started.
  if (isCommitmentActiveOn(commitment.schedule, now, ctx)) {
    const w = fenceWindow(commitment.fence_start, commitment.fence_end, now)
    if (w && isInsideFence(w, now)) return true
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isCommitmentActiveOn(commitment.schedule, yesterday, ctx)) {
    const w = fenceWindow(commitment.fence_start, commitment.fence_end, yesterday)
    if (w && isInsideFence(w, now)) return true
  }
  return false
}

export function nextActivation(commitment: Commitment, now: Date = new Date()): Date | undefined {
  if (commitment.kind !== 'time-fence' || !commitment.fence_start || !commitment.fence_end) {
    return undefined
  }
  const today = fenceWindow(commitment.fence_start, commitment.fence_end, now)
  if (today && today.start > now) return today.start
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return fenceWindow(commitment.fence_start, commitment.fence_end, tomorrow)?.start
}

export function nextDeactivation(commitment: Commitment, now: Date = new Date()): Date | undefined {
  if (commitment.kind !== 'time-fence' || !commitment.fence_start || !commitment.fence_end) {
    return undefined
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const overnight = fenceWindow(commitment.fence_start, commitment.fence_end, yesterday)
  if (overnight && isInsideFence(overnight, now)) return overnight.end

  const today = fenceWindow(commitment.fence_start, commitment.fence_end, now)
  if (today && isInsideFence(today, now)) return today.end

  return undefined
}

export type { Schedule, ScheduleContext }
