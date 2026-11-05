import { requireOptionalNativeModule } from 'expo'

import { useEventStore } from '@/db/events'
import { getPreference, setPreference } from '@/db/repositories/preferences'

// The review sheet arrived in a later build than the runtime it ships on, so
// one bundle serves every install: one without the native module never asks.
// Importing expo-store-review there would throw at launch.
const storeReview = requireOptionalNativeModule('ExpoStoreReview')
  ? (require('expo-store-review') as typeof import('expo-store-review'))
  : undefined

const askedKey = 'review.askedAt'
const prayedDaysBeforeAsking = 5
const daysBetweenAsks = 120

/**
 * Asks for a store rating with the system's own sheet, once someone has
 * prayed on enough days to have an opinion, and again only months later. Both
 * stores ration the sheet themselves (Apple shows it at most three times a
 * year, Play by an undisclosed quota) and never say whether it appeared, so
 * the ask is recorded before it is made: a sheet the store held back still
 * counts, rather than the app asking after every Amen.
 */
export async function askForReviewIfDue(): Promise<void> {
  if (!storeReview) return
  const prayedDays = [...useEventStore.getState().completionsByDate.values()].filter(
    (ids) => ids.size > 0,
  ).length
  if (prayedDays < prayedDaysBeforeAsking) return
  const askedAt = Number((await getPreference(askedKey)) ?? 0)
  if (Date.now() - askedAt < daysBetweenAsks * 86_400_000) return
  if (!(await storeReview.hasAction())) return
  await setPreference(askedKey, String(Date.now()))
  await storeReview.requestReview()
}
