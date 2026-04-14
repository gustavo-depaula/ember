export type Tier = 'essential' | 'ideal' | 'extra'
export type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'

export type UserPractice = {
  practice_id: string
  custom_name: string | null
  custom_icon: string | null
  custom_desc: string | null
  archived: number
}

export type UserPracticeSlot = {
  id: string
  practice_id: string
  slot_id: string
  enabled: number
  sort_order: number
  tier: Tier
  time: string | null
  time_block: TimeBlock
  notify: string | null // JSON NotifyConfig
  schedule: string // JSON Schedule
  // Joined from user_practices
  custom_name: string | null
  custom_icon: string | null
  custom_desc: string | null
  archived: number
}

export type NotifyConfig = {
  enabled: boolean
  before?: number // minutes before, future use
}

export type Completion = {
  id: number
  practice_id: string
  sub_id: string | null
  date: string
  completed_at: number
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

export type CachedTranslation = {
  translation: string
  book: string
  chapter: number
  content: string
  cached_at: number
}
