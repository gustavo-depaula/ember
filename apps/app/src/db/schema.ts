export type Tier = 'essential' | 'ideal' | 'extra'
export type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'

export type UserPractice = {
  practice_id: string
  custom_name: string | null
  custom_icon: string | null
  custom_desc: string | null
  active_variant: string | null
  archived: number
}

export type NotifyReminder = {
  offset: number // minutes before slot.time; 0 = on time
}

export type NotifyConfig = {
  enabled: boolean
  reminders?: NotifyReminder[] // when omitted on enabled config, fall back to manifest defaults
}

// Amen on the prayer screen, a plan checklist tick, a Mass check-in at a church.
export type CompletionVia = 'amen' | 'checklist' | 'checkin'

export type Completion = {
  id: number
  practice_id: string
  sub_id: string | null
  date: string
  completed_at: number
  // The bare id of what was actually prayed, which can differ from
  // `practice_id` (the plan's practice): its active variant. Both fields are
  // absent on completions recorded before they were kept, and on backfills;
  // read it through `prayedIdOf`.
  prayed_id?: string
  via?: CompletionVia
}

/**
 * A holy card redeemed for good: `grant` is the engine's stable id for the act
 * that won it (`mass:2026-10-04`), `date` the day it was redeemed.
 */
export type HolyCardCopy = { grant: string; card: string; date: string }

export type Cursor = {
  id: string
  position: string // JSON
  started_at: string
}

export type Preference = {
  key: string
  value: string
}
