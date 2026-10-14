// What the relay and the app say to each other. The relay holds an account's
// events as sealed bodies it cannot open, under keys it cannot trace back to
// an event; everything it can read is named here.

/** The shape of the log an app writes. An account moves up when a device writes a newer one. */
export const logFormat = 1

/** `[key, body]`: the key tells the relay it already holds this event; the body is the sealed event. */
export type SealedEvent = [key: string, body: string]

export type Profile = {
  name?: string
  email?: string
  phone?: string
  birthday?: string
  /** Asked to be sent news. Never assumed. */
  news?: boolean
}

export type DeviceSeen = { id: string; seenAt: number }

export type AccountView = { profile: Profile; devices: DeviceSeen[]; recoverable: boolean }

export type Pulled = { bodies: string[]; position: number; more: boolean }

export type Pairing = { id: string; code: string; expiresAt: number }

/** What the device asking to join reads while it waits. */
export type PairingState = { answerKey?: string; sealed?: string }

/** Why the relay turned a device away for good. */
export type Gone = { gone: 'account' | 'device' }

export type AnalyticsBatch = {
  install: string
  platform: string
  version: string
  language: string
  // The update the app runs: when it was published, or 'embedded' for the
  // JavaScript the binary shipped with.
  build?: string
  // `day` and `hour` are the device's own, so a habit reads in its owner's time.
  events: { name: string; props?: Record<string, string>; day: string; hour?: number }[]
}

export const maxEventsPerPush = 200
export const pairingMinutes = 10
