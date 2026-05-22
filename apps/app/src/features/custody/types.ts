import type { Schedule, ScheduleContext } from '@/features/plan-of-life/schedule'

export type { Schedule, ScheduleContext }

export type CommitmentKind = 'abstain' | 'time-limit' | 'time-fence'
export type Friction = 'none' | 'wait' | 'prayer'
export type EventType = 'kept' | 'overrode' | 'paused'
export type SessionEndReason = 'completed' | 'aborted' | 'app-killed'
export type SessionAnchorType = 'text' | 'image' | 'prayer' | 'lectio' | 'silence'

export type Target =
  | { kind: 'ios-app'; tokenRef: string }
  | { kind: 'ios-category'; tokenRef: string }
  | { kind: 'android-app'; packageName: string }
  | { kind: 'domain'; domain: string }
  | { kind: 'domain-list'; listKey: 'porn' | 'gambling' | 'social' | 'news' }

// `Anchor` is used by the guided custody-session feature (a meditation
// runner with bells). The iOS shield no longer uses it — shield messages
// come from a rotating pool, see `shieldMessages.ts`.
export type Anchor =
  | { kind: 'text'; text: string; attribution?: string }
  | { kind: 'image'; imageRef: string; caption?: string }
  | { kind: 'prayer'; prayerRef: string; rendered: string }
  | { kind: 'lectio'; reference: string; rendered: string }
  | { kind: 'silence' }

export type FrictionConfig =
  | { kind: 'none' }
  | { kind: 'wait'; waitSeconds: number }
  // depth: 'shallow' = current one-tap acknowledgement; 'deep' = full prayer
  // text + minimum dwell before the button enables. Missing depth on legacy
  // rows is treated as 'shallow' at the call site.
  | { kind: 'prayer'; depth?: 'shallow' | 'deep' }

// `fenceStart` / `fenceEnd` are only meaningful when `kind === 'time-fence'`.
// Times are 24h HH:mm strings (local time, like slot.time elsewhere in the codebase).
export type Commitment = {
  id: string
  name: string
  description: string | null
  kind: CommitmentKind
  targets: Target[]
  schedule: Schedule
  friction: Friction
  friction_config: FrictionConfig | null
  fence_start: string | null
  fence_end: string | null
  limit_seconds: number | null
  archived: number
  created_at: number
  updated_at: number
}

export type CommitmentInput = {
  name: string
  description?: string
  kind: CommitmentKind
  targets: Target[]
  schedule: Schedule
  friction: Friction
  frictionConfig?: FrictionConfig
  fenceStart?: string
  fenceEnd?: string
  limitSeconds?: number
}

export type CommitmentEvent = {
  id: string
  commitment_id: string
  type: EventType
  occurred_at: number
  note: string | null
  metadata: Record<string, unknown> | null
}

export type CustodySession = {
  id: string
  anchor_ref: string
  anchor_type: SessionAnchorType
  planned_seconds: number
  started_at: number
  completed_at: number | null
  ended_reason: SessionEndReason | null
}
