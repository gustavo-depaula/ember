import { format } from 'date-fns'
import { requireOptionalNativeModule } from 'expo'

import { useEventStore } from '@/db/events'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { getToday } from '@/hooks/useToday'
import { track } from '@/lib/usage'

// The review sheet arrived in a later build than the runtime it ships on, so
// one bundle serves every install: one without the native module never asks.
// Importing expo-store-review there would throw at launch.
const storeReview = requireOptionalNativeModule('ExpoStoreReview')
  ? (require('expo-store-review') as typeof import('expo-store-review'))
  : undefined

const askedKey = 'review.askedAt'
const openDaysKey = 'review.prayerOpenDays'
const daysBetweenAsks = 120
// Enough days to judge by; older ones only grow the stored list.
const openDaysKept = 30

async function prayerOpenDays(): Promise<string[]> {
  const stored = await getPreference(openDaysKey)
  return stored ? (JSON.parse(stored) as string[]) : []
}

/**
 * Notes today as a day a prayer was kept open long enough to be prayed. Many
 * never tap Amen at the end, so their completions alone would rarely reach the
 * days a rating waits for.
 */
export async function notePrayerOpenDay(): Promise<void> {
  const today = format(getToday(), 'yyyy-MM-dd')
  const days = await prayerOpenDays()
  if (days.includes(today)) return
  await setPreference(openDaysKey, JSON.stringify([...days, today].slice(-openDaysKept)))
}

// Leaving a prayer after its Amen asks twice at once (from the Amen and from
// the prayer closing); both would pass the check before either records it.
let asking = false

/**
 * Asks for a store rating with the system's own sheet, once someone has
 * prayed on `afterDays` days, enough to have an opinion, and again only months
 * later. A day counts when something was marked prayed or a prayer was kept
 * open (`notePrayerOpenDay`). Leaving a prayer or an Amen asks from the second
 * day; a tick on Today, often a quick catch-up rather than a prayer just
 * finished, from the third. Both stores ration the sheet themselves (Apple
 * shows it at most three times a year, Play by an undisclosed quota) and never
 * say whether it appeared, so the ask is recorded before it is made: a sheet
 * the store held back still counts, rather than the app asking after every
 * prayer.
 */
export async function askForReviewIfDue(afterDays: number): Promise<void> {
  if (!storeReview || asking) return
  asking = true
  try {
    const days = new Set(await prayerOpenDays())
    for (const [date, ids] of useEventStore.getState().completionsByDate) {
      if (ids.size > 0) days.add(date)
    }
    if (days.size < afterDays) return
    const askedAt = Number((await getPreference(askedKey)) ?? 0)
    if (Date.now() - askedAt < daysBetweenAsks * 86_400_000) return
    if (!(await storeReview.hasAction())) return
    await setPreference(askedKey, String(Date.now()))
    track('review_asked')
    await storeReview.requestReview()
  } finally {
    asking = false
  }
}
