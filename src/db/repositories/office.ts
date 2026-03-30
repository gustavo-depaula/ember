import type { SQLiteBindValue } from 'expo-sqlite'

import { getDb } from '../client'
import type { DailyOffice, ReadingTrack } from '../schema'

// --- Daily office (legacy, used during migration) ---

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

// --- Reading tracks ---

export function getReadingTrack(trackId: string): Promise<ReadingTrack | null> {
  return getDb().getFirstAsync<ReadingTrack>('SELECT * FROM reading_tracks WHERE id = ?', [trackId])
}

export function getAllReadingTracks(): Promise<ReadingTrack[]> {
  return getDb().getAllAsync<ReadingTrack>('SELECT * FROM reading_tracks')
}

export function getDefaultReadingTracks(): Promise<ReadingTrack[]> {
  return getDb().getAllAsync<ReadingTrack>("SELECT * FROM reading_tracks WHERE id LIKE 'default-%'")
}

export async function updateReadingTrack(
  trackId: string,
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

  params.push(trackId)
  await getDb().runAsync(`UPDATE reading_tracks SET ${sets.join(', ')} WHERE id = ?`, params)
}

// --- Backward-compatible wrappers (reading_progress → reading_tracks) ---

export function getReadingProgressByType(type: string): Promise<ReadingTrack | null> {
  return getReadingTrack(`default-${type}`)
}

export function getAllReadingProgress(): Promise<ReadingTrack[]> {
  return getDefaultReadingTracks()
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
  return updateReadingTrack(`default-${type}`, updates)
}
