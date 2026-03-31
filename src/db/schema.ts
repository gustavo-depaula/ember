export type Tier = 'essential' | 'ideal' | 'extra'
export type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'

export type UserPractice = {
  practice_id: string
  enabled: number
  sort_order: number
  tier: Tier
  time_block: TimeBlock
  schedule: string // JSON Schedule
  variant: string | null
  custom_name: string | null
  custom_icon: string | null
  custom_desc: string | null
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
