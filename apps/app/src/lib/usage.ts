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

/**
 * What the app counts besides its own log, and what each count names. Every
 * value is a corpus id, a public church or card id, a fixed choice, a number,
 * or a search as typed, cleaned by `searchUsage`. The admin's usage desk reads
 * these names; a change here is a change there.
 */
export type Counts = {
  app_opened: { start?: 'warm' }
  screen: { route: string; id?: string; card?: string; chapter?: string }
  onboarding_reason: { reason: string }
  onboarding_reminders: { reminders: string }
  onboarding_done: { path?: string; reminders?: string }
  // `results` how many were found, `top` the first few ids shown, `opened` the
  // one tapped and `at` its place in the list (from 1).
  search: {
    scope: 'corpus' | 'churches'
    q: string
    results: string
    top?: string
    opened?: string
    at?: string
  }
  church_opened: { church: string; from: 'map' | 'list' | 'search' | 'saved' | 'log' }
  church_action: { church: string; action: string }
  church_verified: { church: string }
  church_correction: { church: string; kind: string }
  // A map view settled on: the geohash cell of its center (about 5 km), what
  // the sentence asked for, how many churches it listed, and whether it was
  // around the person (`here`) or somewhere they looked up.
  mass_area: { cell: string; intent: string; when: string; churches: string; here: '1' | '0' }
  // Today offered a holy card: `won` once it waits to be opened.
  card_offer: { act: string; won: '1' | '0' }
  book_chapter: { id: string; chapter: string }
  bible_chapter: { book: string; chapter: string }
  reminder_opened: { id?: string }
  shared: { id?: string }
  review_asked: Record<string, never>
  app_store_sheet: { action: 'shown' | 'open' | 'later' }
  // How far down a prayer was read, in quarters of the page, and how it was left.
  prayer_read: {
    id: string
    depth: string
    end: 'amen' | 'mass' | 'check-in' | 'mass-check-in' | 'left'
  }
  prayer_language: {
    action: 'pray' | 'follow' | 'layout' | 'swap' | 'only-this' | 'every-prayer' | 'restore'
    id?: string
    value?: string
  }
  // An error, never its message: where it was caught, its kind (the error's
  // name), what failed (a query's first key, a content source), the screen, an
  // HTTP status, and for a crash, the update that crashed.
  error: {
    where: 'query' | 'mutation' | 'uncaught' | 'fatal'
    kind: string
    source?: string
    route?: string
    status?: string
    build?: string
  }
  // The app opened from a link: the prayer it named, at launch or while running.
  link_opened: { id?: string; start: 'cold' | 'warm' }
  // Notifications asked for, and the answer.
  notifications: { asked: 'granted' | 'denied' }
  // Once a day, the shape of the plan: practices kept, their slots, how many
  // remind, and whether notifications may be shown at all.
  plan: { practices: string; slots: string; reminders: string; notifications: string }
}

let waiting: Counted[] = []

// The screen open now, for an error to say where it happened.
let route = ''

export function setUsageRoute(next: string): void {
  route = next
}

export function usageRoute(): string {
  return route
}

function count(name: string, props?: Record<string, string>): void {
  // Beyond this the oldest go: a device long offline is not owed a full record.
  if (waiting.length >= 200) waiting.shift()
  const now = new Date()
  waiting.push({ name, props, day: format(now, 'yyyy-MM-dd'), hour: now.getHours() })
}

export function track<N extends keyof Counts>(name: N, props?: Counts[N]): void {
  count(name, props as Record<string, string> | undefined)
}

const corpusKinds = ['practice', 'book', 'chapter', 'collection', 'chant', 'author'] as const
type CorpusKind = (typeof corpusKinds)[number]
const prefixed = new RegExp(`^(${corpusKinds.join('|')})/`)

/** The corpus id `value` names, or undefined for anything else — a practice
 * someone made has a random id, and that never leaves the device. The app
 * mostly carries ids bare (`mass`, `morrow-my-catholic-faith`), so a bare one
 * is looked up under `kind` first, then under each kind the corpus has. */
export function corpusRef(value: unknown, kind?: CorpusKind): string | undefined {
  if (typeof value !== 'string' || !value) return undefined
  if (prefixed.test(value)) return value
  const items = getCatalog().items
  const kinds = kind ? [kind, ...corpusKinds.filter((k) => k !== kind)] : corpusKinds
  return kinds.map((k) => `${k}/${value}`).find((id) => items[id])
}

// Synced preferences hold only fixed choices (a translation, a language, a
// calendar), so the value goes with the key.
const shortValue = (value: string | null) => (value ?? '').slice(0, 40)

// What an action names when it is something public — a corpus item, a church,
// a holy card — and for a sitting with a book, how long it was.
function named(event: AppEvent): Record<string, string> | undefined {
  switch (event.type) {
    case 'CompletionLogged': {
      const id = corpusRef(event.practiceId, 'practice')
      // How a practice was marked done: the Amen that ends its prayer, a tick on the plan, a Mass
      // check-in. Only the first is praying in Ember, and the counts are read apart by it.
      const via = event.via ? { via: event.via } : undefined
      return id ? { id, ...via } : via
    }
    case 'ReadingLogged': {
      const id = corpusRef(event.bookId, 'book')
      if (!id) return undefined
      return event.ms > 0 ? { id, minutes: String(Math.round(event.ms / 60_000)) } : { id }
    }
    case 'HolyCardRedeemed':
      return { card: event.card, door: event.door }
    case 'ItemSaved': {
      const id = corpusRef(
        event.itemId,
        corpusKinds.find((k) => k === event.kind),
      )
      return id ? { id, kind: event.kind } : { kind: event.kind }
    }
    case 'ItemUnsaved':
    case 'CollectionItemAdded':
    case 'CollectionItemRemoved': {
      const id = corpusRef('itemId' in event ? event.itemId : event.ref)
      return id ? { id } : undefined
    }
    case 'ChurchFavorited':
      return { church: event.church.id }
    case 'ChurchUnfavorited':
      return { church: event.churchId }
    case 'CheckInLogged':
      return { church: event.checkIn.churchId, kind: event.checkIn.kind }
    case 'PreferenceSet':
      return { key: event.key, value: shortValue(event.value) }
    default: {
      const fields = event as { practiceId?: unknown }
      const id = corpusRef(fields.practiceId, 'practice')
      return id ? { id } : undefined
    }
  }
}

// Which update the app runs, so the reach of each one shows.
export function build(): string | undefined {
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
    for (const event of events) count(event.type, named(event))
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
