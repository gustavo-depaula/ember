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

/**
 * How a completion was recorded: Amen at the end of the prayer, a tick on the
 * plan checklist, or a Mass check-in at a church.
 */
export type CompletionVia = 'amen' | 'checklist' | 'checkin'

export type Completion = {
  id: number
  practice_id: string
  sub_id: string | null
  date: string
  completed_at: number
  // What was actually prayed, which can differ from `practice_id` (the plan's
  // practice): its active variant, or a practice outside the plan. Absent on
  // completions recorded before it was kept, and on backfills.
  prayed_id?: string
  via?: CompletionVia
}

export type Cursor = {
  id: string
  position: string // JSON
  started_at: string
}

export type Preference = {
  key: string
  value: string
}
