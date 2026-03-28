import { getDb } from '../client'
import type { Frequency, Practice, PracticeLog, Tier, TimeBlock } from '../schema'

export function getEnabledPractices(): Promise<Practice[]> {
  return getDb().getAllAsync<Practice>(
    'SELECT * FROM practices WHERE enabled = 1 ORDER BY sort_order',
  )
}

export function getAllPractices(): Promise<Practice[]> {
  return getDb().getAllAsync<Practice>('SELECT * FROM practices ORDER BY sort_order')
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

export async function createPractice(data: {
  id: string
  name: string
  icon: string
  frequency: Frequency
  tier: Tier
  timeBlock: TimeBlock
  frequencyDays: number[]
  description: string
}): Promise<void> {
  const db = getDb()
  const maxOrder = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM practices',
  )
  const sortOrder = (maxOrder?.max_order ?? 0) + 1

  await db.runAsync(
    `INSERT INTO practices (id, name, icon, frequency, enabled, sort_order, tier, time_block, frequency_days, is_builtin, description)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, 0, ?)`,
    [
      data.id,
      data.name,
      data.icon,
      data.frequency,
      sortOrder,
      data.tier,
      data.timeBlock,
      JSON.stringify(data.frequencyDays),
      data.description,
    ],
  )
}

const updateFieldMap: Record<string, string> = {
  name: 'name',
  icon: 'icon',
  frequency: 'frequency',
  enabled: 'enabled',
  tier: 'tier',
  timeBlock: 'time_block',
  notifyEnabled: 'notify_enabled',
  notifyTime: 'notify_time',
  description: 'description',
  selectedVariant: 'selected_variant',
}

export async function updatePractice(
  id: string,
  data: Partial<{
    name: string
    icon: string
    frequency: Frequency
    enabled: number
    tier: Tier
    timeBlock: TimeBlock
    frequencyDays: number[]
    notifyEnabled: number
    notifyTime: string | null
    description: string
    selectedVariant: string | null
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
  if (data.frequencyDays !== undefined) {
    sets.push('frequency_days = ?')
    values.push(JSON.stringify(data.frequencyDays))
  }

  if (sets.length === 0) return

  values.push(id)
  await getDb().runAsync(`UPDATE practices SET ${sets.join(', ')} WHERE id = ?`, values)
}

export async function deletePractice(id: string): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM practice_logs WHERE practice_id = ?', [id])
    await db.runAsync('DELETE FROM practices WHERE id = ? AND is_builtin = 0', [id])
  })
}

export async function reorderPractices(orderedIds: string[]): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync('UPDATE practices SET sort_order = ? WHERE id = ?', [i + 1, orderedIds[i]])
    }
  })
}
