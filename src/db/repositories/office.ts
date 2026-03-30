import { format } from 'date-fns'

import { getDb } from '../client'
import type { DailyOffice, PracticeReadingTrack, ReadingTrack } from '../schema'

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

// --- Practice reading tracks ---

function trackId(practiceId: string, trackName: string): string {
  return `${practiceId}/${trackName}`
}

export function getTracksForPractice(practiceId: string): Promise<PracticeReadingTrack[]> {
  return getDb().getAllAsync<PracticeReadingTrack>(
    'SELECT * FROM practice_reading_tracks WHERE practice_id = ?',
    [practiceId],
  )
}

export function getPracticeTrack(
  practiceId: string,
  trackName: string,
): Promise<PracticeReadingTrack | null> {
  return getDb().getFirstAsync<PracticeReadingTrack>(
    'SELECT * FROM practice_reading_tracks WHERE id = ?',
    [trackId(practiceId, trackName)],
  )
}

export async function ensurePracticeTracks(
  practiceId: string,
  trackNames: string[],
  findLegacyIndex?: (trackName: string) => number,
): Promise<void> {
  const db = getDb()
  const today = format(new Date(), 'yyyy-MM-dd')
  const ids = trackNames.map((name) => trackId(practiceId, name))
  const existing = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM practice_reading_tracks WHERE id IN (${ids.map(() => '?').join(',')})`,
    ids,
  )
  const existingIds = new Set(existing.map((r) => r.id))
  for (const trackName of trackNames) {
    const id = trackId(practiceId, trackName)
    if (existingIds.has(id)) continue
    const startIndex = findLegacyIndex?.(trackName) ?? 0
    await db.runAsync(
      'INSERT OR IGNORE INTO practice_reading_tracks (id, practice_id, track, current_index, start_date) VALUES (?, ?, ?, ?, ?)',
      [id, practiceId, trackName, startIndex, today],
    )
  }
}

export async function advancePracticeTrack(
  practiceId: string,
  trackName: string,
  entryCount: number,
): Promise<void> {
  if (entryCount <= 0) return
  await getDb().runAsync(
    `UPDATE practice_reading_tracks SET current_index = (current_index + 1) % ? WHERE id = ?`,
    [entryCount, trackId(practiceId, trackName)],
  )
}

export async function setPracticeTrackIndex(
  practiceId: string,
  trackName: string,
  index: number,
): Promise<void> {
  await getDb().runAsync('UPDATE practice_reading_tracks SET current_index = ? WHERE id = ?', [
    index,
    trackId(practiceId, trackName),
  ])
}

// --- Legacy reading tracks (kept for data migration) ---

export function getLegacyReadingTrack(type: string): Promise<ReadingTrack | null> {
  return getDb().getFirstAsync<ReadingTrack>(
    'SELECT * FROM reading_tracks WHERE id = ? OR id = ?',
    [`default-${type}`, type],
  )
}
