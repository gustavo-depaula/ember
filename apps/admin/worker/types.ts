import type { Proposal, Resolution } from '@ember/api/src/moderation'
import type { Church } from '@ember/api/src/schema'

// What the desk's Worker and its page say to each other.

export type Suggestion = {
  id: string
  kind: string
  serviceId?: string
  createdAt: string
  comment?: string
  changes?: Record<string, string>
  attachmentKeys: string[]
  // How this sender's other corrections were settled, as a hint of how far to trust them.
  reporter: { accepted: number; rejected: number }
}

// Claude's draft for a church, and the suggestions it had in front of it.
export type Review = {
  proposal: Proposal
  sessionId: string
  suggestionIds: string[]
  reviewedAt: string
  costUsd?: number
  // The version of the brief it was written under, and whether that is no longer the current one.
  brief: number
  outdated?: boolean
}

export type Run = {
  status: 'queued' | 'running' | 'failed'
  activity: string[]
  error?: string
}

// One church with suggestions waiting. `church` is missing when they name a church the directory
// doesn't hold.
// Another church a resolution may reach: one of the same parish (the parish church, a sibling
// chapel), or one standing close by that may turn out to be a chapel nobody has linked yet.
export type OtherChurch = { church: Church; distanceKm: number; sameParish: boolean }

export type Case = {
  churchId: string
  church?: Church
  others: OtherChurch[]
  suggestions: Suggestion[]
  verifications: number // "times are correct" taps in the last 30 days
  review?: Review
  run?: Run
}

export type HistoryEntry = {
  id: string
  churchId: string
  churchName: string
  appliedAt: string
  summary: string
  undoneAt?: string
}

// In the log an entry also keeps what undo needs, and what the change log tells other directories:
// every church the resolution touched, before and after (`before` is missing for one it created),
// what the change rested on, and whether it has been passed on.
export type StoredHistoryEntry = HistoryEntry & {
  records: Array<{ before?: Church; after: Church }>
  resolution: Resolution
  basis?: string
  sharedAt?: string
}

export type Desk = {
  target: 'remote' | 'local'
  loadedAt: string
  cases: Case[]
  history: HistoryEntry[]
  // Applied resolutions that changed a church and still stand, newest first.
  log: StoredHistoryEntry[]
}

// What the page polls while a review is under way: every run, by church, and when each church's
// draft was written, so the page knows to fetch the desk again once a run has turned into one.
export type Progress = { runs: Record<string, Run>; reviewedAt: Record<string, string> }

// What the page saw of each church a resolution names (its `updatedAt`), so a row that moved since
// is refused instead of overwritten.
export type Seen = Record<string, string | null>

// The usage desk. Every count is of installs unless it says otherwise. The desk reads one tab at
// a time; each has its own counts.

export const usageTabs = [
  'overview',
  'onboarding',
  'prayer',
  'mass',
  'cards',
  'library',
  'search',
  'features',
  'health',
] as const
export type UsageTab = (typeof usageTabs)[number]

export type UsageFilter = { days: number; platform: string; language: string }

type Period = {
  // The latest day any install has reached, which the periods end on.
  today: string
  filter: UsageFilter
}

type Ranked = { installs: number; times: number }

export type Pulse = {
  today: number
  yesterday: number
  period: number
  periodBefore: number
  opened: number
  openedBefore: number
  amen: number
  amenBefore: number
  ever: number
}

export type Overview = Period & {
  pulse: Pulse
  newcomers: { period: number; before: number }
  daily: { day: string; active: number; opened: number; amen: number; new: number; opens: number }[]
  cohorts: { cohort: string; week: number; installs: number }[]
  audience: {
    facet: 'platform' | 'language' | 'version' | 'update'
    value: string
    installs: number
  }[]
  // Installs first seen 4 to 17 weeks ago, and for each thing they might have done in their first
  // week, how many did it and how many of those were still around in their fourth week.
  predictors: {
    behavior: string
    did: number
    didKept: number
    didNot: number
    didNotKept: number
  }[]
}

export type Onboarding = Period & {
  funnel: {
    started: number
    reasoned: number
    reminders: number
    finished: number
    skipped: number
  }
  steps: { route: string; installs: number }[]
  // Each reason, and what its installs did in their first week. `judged` are those old enough
  // to have had a week.
  reasons: {
    reason: string
    installs: number
    finished: number
    remindersOn: number
    judged: number
    returned: number
    prayed: number
    amen: number
  }[]
  daily: { day: string; started: number; finished: number }[]
}

export type Prayer = Period & {
  pulse: Pulse
  habit: { what: 'opened' | 'amen'; days: number; installs: number }[]
  unfinished: { openedDays: number; amenDays: number; neverAmen: number }
  practices: { id: string; times: number; installs: number; before: number; opened?: number }[]
  hours: { weekday: number; hour: number; times: number }[]
  // A day's prayers, by install-day: how many of the offering, the midday and the examen were
  // marked, and whether the Rosary was.
  arc: { stations: number; rosary: number; days: number; installs: number }[]
  stations: { offering: number; midday: number; examen: number }
  reminders: { id: string; installs: number; times: number; prayed: number }[]
  // How far down each prayer is read, and how it is left.
  reading: {
    id: string
    sessions: number
    installs: number
    depth: number
    whole: number
    amen: number
    mass: number
    left: number
  }[]
  languages: { action: string; value: string; times: number; installs: number }[]
}

export type Place = {
  city: string
  region: string
  installs: number
  views: number
  here: number
  empty: number
}

export type ChurchUse = {
  id: string
  name?: string
  city?: string
  region?: string
  scheduled?: boolean
  services?: number
  verified?: string
  openers: number
  opens: number
  checkers: number
  checkins: number
  favorites: number
  directions: number
  contact: number
}

export type MassTimes = Period & {
  totals: {
    visitors: number
    opened: number
    openers: number
    checkins: number
    checkers: number
    favorites: number
    verified: number
    corrections: number
  }
  daily: { day: string; visitors: number; checkins: number }[]
  places: Place[]
  churches: ChurchUse[]
  from: { from: string; times: number }[]
  kinds: { kind: string; times: number; installs: number }[]
  asked: { intent: string; when: string; times: number }[]
}

export type HolyCards = Period & {
  totals: {
    collectors: number
    redeemed: number
    offerDays: number
    wonDays: number
    openedDays: number
  }
  daily: { day: string; offered: number; won: number; redeemed: number }[]
  doors: ({ door: string } & Ranked)[]
  saints: { card: string; redeemed: number; viewers: number }[]
  // All the cards each install holds, whatever the period.
  held: { cards: number; installs: number }[]
}

export type Library = Period & {
  books: { id: string; installs: number; sittings: number; minutes: number }[]
  reach: {
    id: string
    readers: number
    chapters: number
    average: number
    most: number
    far: number
  }[]
  bible: { book: string; installs: number; chapters: number }[]
  bibleTotals: { installs: number; chapters: number }
  saved: { kind: string; installs: number; times: number }[]
  savedItems: ({ id: string } & Ranked)[]
  collections: { made: number; makers: number; added: number; adders: number }
  collected: ({ id: string } & Ranked)[]
}

export type SearchScope = {
  totals: { searches: number; installs: number; opened: number; empty: number }
  queries: { q: string; installs: number; times: number; results: number; opened: number }[]
  empty: { q: string; installs: number; times: number }[]
  opened: { id: string; times: number; installs: number; at: number }[]
  positions: { at: number; times: number }[]
}

export type Search = Period & {
  corpus: SearchScope
  churches: SearchScope
  names: Record<string, string>
}

export type Features = Period & {
  screens: { route: string; views: number; installs: number }[]
  actions: ({ name: string } & Ranked)[]
  preferences: { key: string; value: string; installs: number }[]
  shared: ({ id: string } & Ranked)[]
  appStore: { action: string; installs: number; times: number }[]
  links: { id: string; cold: number; warm: number; installs: number }[]
  notifications: { asked: string; installs: number }[]
  // Each install's latest plan in the period.
  plans: { practices: number; reminders: number; installs: number }[]
  permissions: { status: string; installs: number }[]
  planDaily: { day: string; practices: number; reminders: number }[]
  accounts: {
    accounts: number
    reachable: number
    news: number
    recovery: number
    deleted: number
    activeWeek: number
    devices: { devices: number; accounts: number }[]
    weekly: { week: string; created: number; deleted: number }[]
  }
}

export type Health = Period & {
  totals: { errors: number; erring: number; active: number; fatal: number }
  daily: { day: string; active: number; erring: number; errors: number }[]
  // Each update: installs that ran it, those that met an error, the errors and crashes, and the
  // installs that said an Amen on it.
  builds: {
    build: string
    installs: number
    erring: number
    errors: number
    fatal: number
    amen: number
  }[]
  kinds: { where: string; kind: string; status: string | null; times: number; installs: number }[]
  sources: { source: string; where: string; times: number; installs: number }[]
  routes: { route: string; times: number; installs: number }[]
}

export type UsageOf = {
  overview: Overview
  onboarding: Onboarding
  prayer: Prayer
  mass: MassTimes
  cards: HolyCards
  library: Library
  search: Search
  features: Features
  health: Health
}
