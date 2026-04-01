import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'
import { getDb } from '../client'
import type { Completion, UserPractice, UserPracticeSlot } from '../schema'

// --- User practices (thin definition table) ---

export function getPractice(practiceId: string): Promise<UserPractice | null> {
  return getDb().getFirstAsync<UserPractice>('SELECT * FROM user_practices WHERE practice_id = ?', [
    practiceId,
  ])
}

export async function createPractice(data: {
  id: string
  customName?: string
  customIcon?: string
  customDesc?: string
}): Promise<void> {
  await getDb().runAsync(
    'INSERT OR IGNORE INTO user_practices (practice_id, custom_name, custom_icon, custom_desc) VALUES (?, ?, ?, ?)',
    [data.id, data.customName ?? null, data.customIcon ?? null, data.customDesc ?? null],
  )
}

export async function updatePractice(
  practiceId: string,
  data: Partial<{
    customName: string | null
    customIcon: string | null
    customDesc: string | null
  }>,
): Promise<void> {
  const fieldMap: Record<string, string> = {
    customName: 'custom_name',
    customIcon: 'custom_icon',
    customDesc: 'custom_desc',
  }

  const sets: string[] = []
  const values: (string | null)[] = []

  for (const [key, column] of Object.entries(fieldMap)) {
    const val = data[key as keyof typeof data]
    if (val !== undefined) {
      sets.push(`${column} = ?`)
      values.push(val)
    }
  }

  if (sets.length === 0) return

  values.push(practiceId)
  await getDb().runAsync(
    `UPDATE user_practices SET ${sets.join(', ')} WHERE practice_id = ?`,
    values,
  )
}

export async function createPracticeWithSlot(
  practice: { id: string; customName?: string; customIcon?: string; customDesc?: string },
  slotData: Parameters<typeof addSlot>[1],
): Promise<string> {
  const db = getDb()
  let slotKey = ''
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT OR IGNORE INTO user_practices (practice_id, custom_name, custom_icon, custom_desc) VALUES (?, ?, ?, ?)',
      [
        practice.id,
        practice.customName ?? null,
        practice.customIcon ?? null,
        practice.customDesc ?? null,
      ],
    )
    slotKey = await addSlot(practice.id, slotData)
  })
  return slotKey
}

export async function deletePractice(practiceId: string): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions WHERE practice_id = ?', [practiceId])
    await db.runAsync('DELETE FROM user_practice_slots WHERE practice_id = ?', [practiceId])
    await db.runAsync('DELETE FROM user_practices WHERE practice_id = ?', [practiceId])
  })
}

// --- Slots ---

const slotJoinQuery = `
  SELECT s.*, p.custom_name, p.custom_icon, p.custom_desc
  FROM user_practice_slots s
  LEFT JOIN user_practices p ON s.practice_id = p.practice_id`

export function getEnabledSlots(): Promise<UserPracticeSlot[]> {
  return getDb().getAllAsync<UserPracticeSlot>(
    `${slotJoinQuery} WHERE s.enabled = 1 ORDER BY s.sort_order`,
  )
}

export function getAllSlots(): Promise<UserPracticeSlot[]> {
  return getDb().getAllAsync<UserPracticeSlot>(`${slotJoinQuery} ORDER BY s.sort_order`)
}

export function getSlotsForPractice(practiceId: string): Promise<UserPracticeSlot[]> {
  return getDb().getAllAsync<UserPracticeSlot>(
    `${slotJoinQuery} WHERE s.practice_id = ? ORDER BY s.sort_order`,
    [practiceId],
  )
}

export async function addSlot(
  practiceId: string,
  data: {
    slotId?: string
    tier?: string
    time?: string
    schedule?: string
    variant?: string
  },
): Promise<string> {
  const db = getDb()

  const slotId = data.slotId ?? (await nextSlotId(db, practiceId))
  const id = composeSlotKey(practiceId, slotId)

  const maxOrder = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) as max_order FROM user_practice_slots',
  )
  const sortOrder = (maxOrder?.max_order ?? 0) + 1

  const time = data.time ?? null
  const timeBlock = deriveTimeBlock(time)

  await db.runAsync(
    `INSERT INTO user_practice_slots (id, practice_id, slot_id, enabled, sort_order, tier, time, time_block, schedule, variant)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      practiceId,
      slotId,
      sortOrder,
      data.tier ?? 'ideal',
      time,
      timeBlock,
      data.schedule ?? '{"type":"daily"}',
      data.variant ?? null,
    ],
  )

  return id
}

async function nextSlotId(db: ReturnType<typeof getDb>, practiceId: string): Promise<string> {
  const row = await db.getFirstAsync<{ max_id: number | null }>(
    "SELECT MAX(CAST(slot_id AS INTEGER)) as max_id FROM user_practice_slots WHERE practice_id = ? AND slot_id GLOB '[0-9]*'",
    [practiceId],
  )
  return String((row?.max_id ?? 0) + 1)
}

const slotFieldMap: Record<string, string> = {
  enabled: 'enabled',
  sortOrder: 'sort_order',
  tier: 'tier',
  time: 'time',
  timeBlock: 'time_block',
  notify: 'notify',
  schedule: 'schedule',
  variant: 'variant',
}

export async function updateSlot(
  slotId: string,
  data: Partial<{
    enabled: number
    sortOrder: number
    tier: string
    time: string | null
    timeBlock: string
    notify: string | null
    schedule: string
    variant: string | null
  }>,
): Promise<void> {
  if (data.time !== undefined && data.timeBlock === undefined) {
    data.timeBlock = deriveTimeBlock(data.time)
  }

  const sets: string[] = []
  const values: (string | number | null)[] = []

  for (const [key, column] of Object.entries(slotFieldMap)) {
    const val = data[key as keyof typeof data]
    if (val !== undefined) {
      sets.push(`${column} = ?`)
      values.push(val as string | number | null)
    }
  }

  if (sets.length === 0) return

  values.push(slotId)
  await getDb().runAsync(`UPDATE user_practice_slots SET ${sets.join(', ')} WHERE id = ?`, values)
}

export async function deleteSlot(slotId: string): Promise<void> {
  const db = getDb()
  const { practiceId, slotId: subId } = parseSlotKey(slotId)
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM completions WHERE practice_id = ? AND sub_id = ?', [
      practiceId,
      subId,
    ])
    await db.runAsync('DELETE FROM user_practice_slots WHERE id = ?', [slotId])
  })
}

export async function enableSlotsForPractice(practiceId: string): Promise<void> {
  await getDb().runAsync('UPDATE user_practice_slots SET enabled = 1 WHERE practice_id = ?', [
    practiceId,
  ])
}

export async function reorderSlots(orderedIds: string[]): Promise<void> {
  const db = getDb()
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync('UPDATE user_practice_slots SET sort_order = ? WHERE id = ?', [
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
  subId?: string,
): Promise<void> {
  const db = getDb()
  if (completed) {
    await logCompletion(practiceId, date, subId)
  } else if (subId) {
    await db.runAsync('DELETE FROM completions WHERE practice_id = ? AND date = ? AND sub_id = ?', [
      practiceId,
      date,
      subId,
    ])
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
