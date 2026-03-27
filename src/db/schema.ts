export type Tier = 'essential' | 'ideal' | 'extra'
export type TimeBlock = 'morning' | 'daytime' | 'evening' | 'flexible'
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
  frequency_days: string // JSON array of day numbers (0=Sun..6=Sat)
  notify_enabled: number
  notify_time: string | null
  is_builtin: number
  description: string
}

export type PracticeLog = {
  date: string
  practice_id: string
  completed: number
  completed_at: number | null
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

export type CachedTranslation = {
  translation: string
  book: string
  chapter: number
  content: string
  cached_at: number
}
