import type { SQLiteBindValue } from 'expo-sqlite'

import { getDb } from '../client'
import type { DailyOffice, ReadingProgress } from '../schema'

export function getDailyOfficeForDate(date: string): Promise<DailyOffice[]> {
	return getDb().getAllAsync<DailyOffice>('SELECT * FROM daily_office WHERE date = ?', [date])
}

export async function completeOfficeHour(date: string, hour: string): Promise<void> {
	const ts = Date.now()
	await getDb().runAsync(
		`INSERT INTO daily_office (date, hour, completed, completed_at)
		VALUES (?, ?, 1, ?)
		ON CONFLICT (date, hour) DO UPDATE SET completed = 1, completed_at = ?`,
		[date, hour, ts, ts],
	)
}

export function getReadingProgressByType(type: string): Promise<ReadingProgress | null> {
	return getDb().getFirstAsync<ReadingProgress>('SELECT * FROM reading_progress WHERE type = ?', [
		type,
	])
}

export function getAllReadingProgress(): Promise<ReadingProgress[]> {
	return getDb().getAllAsync<ReadingProgress>('SELECT * FROM reading_progress')
}

export async function updateReadingProgress(
	type: string,
	updates: {
		currentBook?: string
		currentChapter?: number
		currentVerse?: number
		completedBooks?: string
		completedChapters?: string
	},
): Promise<void> {
	const sets: string[] = []
	const params: SQLiteBindValue[] = []

	if (updates.currentBook !== undefined) {
		sets.push('current_book = ?')
		params.push(updates.currentBook)
	}
	if (updates.currentChapter !== undefined) {
		sets.push('current_chapter = ?')
		params.push(updates.currentChapter)
	}
	if (updates.currentVerse !== undefined) {
		sets.push('current_verse = ?')
		params.push(updates.currentVerse)
	}
	if (updates.completedBooks !== undefined) {
		sets.push('completed_books = ?')
		params.push(updates.completedBooks)
	}
	if (updates.completedChapters !== undefined) {
		sets.push('completed_chapters = ?')
		params.push(updates.completedChapters)
	}

	if (sets.length === 0) return

	params.push(type)
	await getDb().runAsync(`UPDATE reading_progress SET ${sets.join(', ')} WHERE type = ?`, params)
}
