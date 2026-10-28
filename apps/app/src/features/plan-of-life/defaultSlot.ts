import type { PracticeManifest } from '@/content/types'
import type { Tier } from '@/db/schema'

/** Where a practice asks to stand in a plan it joins for the first time. */
export function defaultSlotOf(manifest: PracticeManifest | undefined) {
  const slot = manifest?.defaults?.slots?.[0]
  return {
    tier: (slot?.tier as Tier | undefined) ?? 'ideal',
    time: slot?.time,
    sortOrder: manifest?.defaults?.sortOrder,
  }
}
