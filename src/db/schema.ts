export type Practice = {
	id: string
	name: string
	icon: string
	frequency: string
	enabled: number
	sort_order: number
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
