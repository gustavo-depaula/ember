import { getDb } from '../client'
import type { Practice, PracticeLog } from '../schema'

export function getEnabledPractices(): Promise<Practice[]> {
  return getDb().getAllAsync<Practice>(
    'SELECT * FROM practices WHERE enabled = 1 ORDER BY sort_order',
  )
}

export function getPracticeLogsForDate(date: string): Promise<PracticeLog[]> {
  return getDb().getAllAsync<PracticeLog>('SELECT * FROM practice_logs WHERE date = ?', [date])
}

export function getPracticeLogRange(startDate: string, endDate: string): Promise<PracticeLog[]> {
  return getDb().getAllAsync<PracticeLog>(
    'SELECT * FROM practice_logs WHERE date BETWEEN ? AND ? AND completed = 1',
    [startDate, endDate],
  )
}

export async function togglePractice(
  practiceId: string,
  date: string,
  completed: boolean,
): Promise<void> {
  const val = completed ? 1 : 0
  const ts = completed ? Date.now() : null
  await getDb().runAsync(
    `INSERT INTO practice_logs (date, practice_id, completed, completed_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT (date, practice_id) DO UPDATE SET completed = ?, completed_at = ?`,
    [date, practiceId, val, ts, val, ts],
  )
}

export async function getPracticeCompletedDates(practiceId: string): Promise<string[]> {
  const logs = await getDb().getAllAsync<PracticeLog>(
    'SELECT * FROM practice_logs WHERE practice_id = ? AND completed = 1',
    [practiceId],
  )
  return logs.map((l) => l.date)
}
