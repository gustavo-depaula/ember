/**
 * Per-practice voice selection. Stores which guided-prayer playlist the user
 * prefers for each practice; nullable means "silent" (default).
 */

import { getDb } from '../client'

export async function getVoice(practiceId: string): Promise<string | undefined> {
  const row = await getDb().getFirstAsync<{ guided_id: string | null }>(
    'SELECT guided_id FROM practice_voice WHERE practice_id = ?',
    [practiceId],
  )
  return row?.guided_id ?? undefined
}

export async function setVoice(practiceId: string, guidedId: string | undefined): Promise<void> {
  await getDb().runAsync(
    `INSERT INTO practice_voice (practice_id, guided_id, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT (practice_id) DO UPDATE SET
       guided_id = excluded.guided_id,
       updated_at = excluded.updated_at`,
    [practiceId, guidedId ?? null, Date.now()],
  )
}

export async function clearVoice(practiceId: string): Promise<void> {
  await getDb().runAsync('DELETE FROM practice_voice WHERE practice_id = ?', [practiceId])
}
