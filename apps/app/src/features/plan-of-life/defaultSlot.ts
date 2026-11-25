import type { PracticeManifest } from '@/content/types'
import type { Tier } from '@/db/schema'
import { clockOf } from '@/features/explore/prayNowOrder'

/** Where a practice asks to stand in a plan it joins for the first time. */
export function defaultSlotOf(manifest: PracticeManifest | undefined) {
  const slot = manifest?.defaults?.slots?.[0]
  return {
    tier: (slot?.tier as Tier | undefined) ?? 'ideal',
    time: slot?.time,
    sortOrder: manifest?.defaults?.sortOrder,
  }
}

/** The half hour after `now`, as HH:MM. */
export function nextHalfHour(now = new Date()): string {
  const minutes = now.getHours() * 60 + now.getMinutes()
  return clockOf((Math.floor(minutes / 30) + 1) * 30)
}
