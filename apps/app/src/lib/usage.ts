import type { AnalyticsBatch } from '@ember/relay'
import { format } from 'date-fns'
import Constants from 'expo-constants'
import { AppState, Platform } from 'react-native'

import type { AppEvent } from '@/db/events'
import { onEventsWritten } from '@/db/events'
import { getPreference, removePreference, setPreference } from '@/db/repositories/preferences'
import { relay } from '@/features/sync/relay'
import i18n from '@/lib/i18n'
import { randomId } from '@/lib/id'

// Which parts of Ember get used, counted under an id this install draws for
// that alone. It is never sent alongside an account, and it names only what
// the corpus names — a practice, a book — never anything a person wrote.

const offKey = 'usage.off'
const installKey = 'usage.install'

type Counted = AnalyticsBatch['events'][number]

let waiting: Counted[] = []

export function track(name: string, props?: Record<string, string>): void {
  // Beyond this the oldest go: a device long offline is not owed a full record.
  if (waiting.length >= 200) waiting.shift()
  waiting.push({ name, props, day: format(new Date(), 'yyyy-MM-dd') })
}

const corpusId = /^(practice|book|chapter|collection|saint)\//

// What an action names, when it is something in the corpus.
function named(event: AppEvent): Record<string, string> | undefined {
  const fields = event as { practiceId?: unknown; bookId?: unknown; itemId?: unknown }
  const id = [fields.practiceId, fields.bookId, fields.itemId].find(
    (value): value is string => typeof value === 'string' && corpusId.test(value),
  )
  return id ? { id } : undefined
}

export async function isUsageShared(): Promise<boolean> {
  return (await getPreference(offKey)) === undefined
}

export async function setUsageShared(shared: boolean): Promise<void> {
  if (shared) return removePreference(offKey)
  waiting = []
  // Switched off, the id goes too: switching back on starts a new one.
  await removePreference(installKey)
  await setPreference(offKey, '1')
}

async function installId(): Promise<string> {
  const existing = await getPreference(installKey)
  if (existing) return existing
  const id = randomId()
  await setPreference(installKey, id)
  return id
}

// A development build counts only into a relay it was pointed at.
const counted = !__DEV__ || Boolean(process.env.EXPO_PUBLIC_RELAY_URL)

async function send(): Promise<void> {
  if (waiting.length === 0) return
  if (!counted) {
    waiting = []
    return
  }
  if (!(await isUsageShared())) {
    waiting = []
    return
  }
  const events = waiting
  waiting = []
  await relay
    .sendUsage({
      install: await installId(),
      platform: Platform.OS,
      version: Constants.expoConfig?.version ?? '',
      language: i18n.language,
      events,
    })
    // Out of reach: these counts are let go rather than kept for later.
    .catch(() => undefined)
}

/** Counts from here on, sending about once a minute and when the app is put away. Returns the way to stop. */
export function startUsage(): () => void {
  track('app_opened')
  const stopListening = onEventsWritten((events) => {
    for (const event of events) track(event.type, named(event))
  })
  const everyMinute = setInterval(send, 60_000)
  const appState = AppState.addEventListener('change', (state) => {
    if (state !== 'active') send()
  })
  return () => {
    stopListening()
    clearInterval(everyMinute)
    appState.remove()
  }
}
