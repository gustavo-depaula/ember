import type { AnalyticsBatch } from '@ember/relay'
import { format } from 'date-fns'
import Constants from 'expo-constants'
import * as Updates from 'expo-updates'
import { AppState, Platform } from 'react-native'

import { getCatalog } from '@/content/contentIndex'
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
  const now = new Date()
  waiting.push({ name, props, day: format(now, 'yyyy-MM-dd'), hour: now.getHours() })
}

const corpusId = /^(practice|book|chapter|collection|saint)\//

/** The corpus id `value` names, or undefined for anything else — a practice
 * someone made has a random id, and that never leaves the device. Plans and
 * links still carry practices by bare slug (`mass`), so those are looked up. */
export function corpusRef(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  if (corpusId.test(value)) return value
  return getCatalog().items[`practice/${value}`] ? `practice/${value}` : undefined
}

// What an action names, when it is something in the corpus, and for a sitting
// with a book, how long it was.
function named(event: AppEvent): Record<string, string> | undefined {
  const fields = event as { practiceId?: unknown; bookId?: unknown; itemId?: unknown }
  const id = [fields.practiceId, fields.bookId, fields.itemId].map(corpusRef).find(Boolean)
  if (!id) return undefined
  if (event.type === 'ReadingLogged' && event.ms > 0) {
    return { id, minutes: String(Math.round(event.ms / 60_000)) }
  }
  return { id }
}

// Which update the app runs, so the reach of each one shows.
function build(): string | undefined {
  if (Updates.isEmbeddedLaunch) return 'embedded'
  return Updates.createdAt?.toISOString().slice(0, 16)
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
      build: build(),
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
  let last = AppState.currentState
  const appState = AppState.addEventListener('change', (state) => {
    // Coming back to the app counts as an open too: praying the hours is a
    // return to it through the day, not a launch. iOS passes through
    // 'inactive' for a glance at Control Center, which is not one.
    if (state === 'active' && last === 'background') track('app_opened', { start: 'warm' })
    if (state !== 'active') send()
    last = state
  })
  return () => {
    stopListening()
    clearInterval(everyMinute)
    appState.remove()
  }
}
