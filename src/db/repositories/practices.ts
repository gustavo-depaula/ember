import { getDb } from '../client'
import type { Completion, UserPractice } from '../schema'

// --- User practices ---

export function getEnabledPractices(): Promise<UserPractice[]> {
  return getDb().getAllAsync<UserPractice>(
    'SELECT * FROM user_practices WHERE enabled = 1 ORDER BY sort_order',
  )
}

export function getAllPractices(): Promise<UserPractice[]> {
  return getDb().getAllAsync<UserPractice>('SELECT * FROM user_practices ORDER BY sort_order')
}

export async function createPractice(data: {
  id: string
  customName: string
  customIcon: string
  tier: string
  timeBlock: string
  schedule: string
  customDesc: string
}): Promise<void> {
  const db = getDb()
  const maxOrder = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM user_practices',
  )
  const sortOrder = (maxOrder?.max_order ?? 0) + 1

  await db.runAsync(
    `INSERT INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule, custom_name, custom_icon, custom_desc)
     VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      sortOrder,
      data.tier,
      data.timeBlock,
      data.schedule,
      data.customName,
      data.customIcon,
      data.customDesc,
    ],
  )
}

const updateFieldMap: Record<string, string> = {
  enabled: 'enabled',
  tier: 'tier',
  timeBlock: 'time_block',
  schedule: 'schedule',
  variant: 'variant',
  customName: 'custom_name',
  customIcon: 'custom_icon',
  customDesc: 'custom_desc',
}

export async function updatePractice(
  id: string,
  data: Partial<{
    enabled: number
    tier: string
    timeBlock: string
    schedule: string
    variant: string | null
    customName: string
    customIcon: string
    customDesc: string
  }>,
): Promise<void> {
  const sets: string[] = []
  const values: (string | number | null)[] = []

  for (const [key, column] of Object.entries(updateFieldMap)) {
    const val = data[key as keyof typeof data]
    if (val !== undefined) {
      sets.push(`${column} = ?`)
      values.push(val as string | number | null)
    }
  }

  if (sets.length === 0) return

  values.push(id)
  await getDb().runAsync(
    `UPDATE user_practices SET ${sets.join(', ')} WHERE practice_id = ?`,
    values,
  )
}

export async function deletePractice(id: string): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions WHERE practice_id = ?', [id])
    // Only delete if it has custom fields (user-created) or no manifest
    await db.runAsync('DELETE FROM user_practices WHERE practice_id = ?', [id])
  })
}

export async function reorderPractices(orderedIds: string[]): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync('UPDATE user_practices SET sort_order = ? WHERE practice_id = ?', [
        i + 1,
        orderedIds[i],
      ])
    }
  })
}

// --- Completions ---

export async function logCompletion(
  practiceId: string,
  date: string,
  subId?: string,
): Promise<void> {
  const ts = Date.now()
  await getDb().runAsync(
    'INSERT INTO completions (practice_id, sub_id, date, completed_at) VALUES (?, ?, ?, ?)',
    [practiceId, subId ?? null, date, ts],
  )
}

export async function removeCompletion(id: number): Promise<void> {
  await getDb().runAsync('DELETE FROM completions WHERE id = ?', [id])
}

export function getCompletionsForDate(date: string): Promise<Completion[]> {
  return getDb().getAllAsync<Completion>('SELECT * FROM completions WHERE date = ?', [date])
}

export function getCompletionsForPractice(practiceId: string, date: string): Promise<Completion[]> {
  return getDb().getAllAsync<Completion>(
    'SELECT * FROM completions WHERE practice_id = ? AND date = ?',
    [practiceId, date],
  )
}

export async function getCompletionDates(practiceId: string): Promise<string[]> {
  const rows = await getDb().getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM completions WHERE practice_id = ?',
    [practiceId],
  )
  return rows.map((r) => r.date)
}

export function getCompletionRange(startDate: string, endDate: string): Promise<Completion[]> {
  return getDb().getAllAsync<Completion>('SELECT * FROM completions WHERE date BETWEEN ? AND ?', [
    startDate,
    endDate,
  ])
}

export async function toggleCompletion(
  practiceId: string,
  date: string,
  completed: boolean,
): Promise<void> {
  const db = getDb()
  if (completed) {
    const ts = Date.now()
    await db.runAsync(
      'INSERT INTO completions (practice_id, sub_id, date, completed_at) VALUES (?, NULL, ?, ?)',
      [practiceId, date, ts],
    )
  } else {
    await db.runAsync(
      'DELETE FROM completions WHERE practice_id = ? AND date = ? AND sub_id IS NULL',
      [practiceId, date],
    )
  }
}

export async function isPracticeCompletedOnDate(
  practiceId: string,
  date: string,
): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ cnt: number }>(
    'SELECT EXISTS(SELECT 1 FROM completions WHERE practice_id = ? AND date = ?) as cnt',
    [practiceId, date],
  )
  return row?.cnt === 1
}

// --- Legacy compatibility (used during transition) ---

export function getLegacyPracticeLogsForDate(
  date: string,
): Promise<
  Array<{ date: string; practice_id: string; completed: number; completed_at: number | null }>
> {
  return getDb().getAllAsync('SELECT * FROM practice_logs WHERE date = ?', [date])
}

export function getLegacyPracticeLogRange(
  startDate: string,
  endDate: string,
): Promise<
  Array<{ date: string; practice_id: string; completed: number; completed_at: number | null }>
> {
  return getDb().getAllAsync(
    'SELECT * FROM practice_logs WHERE date BETWEEN ? AND ? AND completed = 1',
    [startDate, endDate],
  )
}

export async function toggleLegacyPractice(
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
