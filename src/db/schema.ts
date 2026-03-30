// --- V2 schema types (4-table model) ---

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

// --- Legacy types (kept for migration compatibility) ---

export type Frequency = 'daily' | 'weekly' | 'custom'

export type Practice = {
  id: string
  name: string
  icon: string
  frequency: Frequency
  enabled: number
  sort_order: number
  tier: Tier
  time_block: TimeBlock
  frequency_days: string
  notify_enabled: number
  notify_time: string | null
  is_builtin: number
  description: string
  manifest_id: string | null
  selected_variant: string | null
}

export type PracticeLog = {
  date: string
  practice_id: string
  completed: number
  completed_at: number | null
}

export type PracticeCompletion = {
  id: number
  practice_id: string
  detail: string | null
  date: string
  completed_at: number
}

export type ReadingProgress = {
  type: string
  current_book: string
  current_chapter: number
  current_verse: number
  completed_books: string
  completed_chapters: string
  start_date: string
}

export type ReadingTrack = {
  id: string
  type: string
  label: string | null
  current_book: string
  current_chapter: number
  current_verse: number
  completed_books: string
  completed_chapters: string
  start_date: string
}

export type DailyOffice = {
  date: string
  hour: string
  completed: number
  completed_at: number | null
}

export type OfficePreference = {
  key: string
  value: string
}

export type PracticeReadingTrack = {
  id: string
  practice_id: string
  track: string
  current_index: number
  start_date: string
}
