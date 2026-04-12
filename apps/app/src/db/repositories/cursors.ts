import { format } from 'date-fns'

import { getDb } from '../client'
import type { Cursor } from '../schema'

export function getCursor(id: string): Promise<Cursor | null> {
  return getDb().getFirstAsync<Cursor>('SELECT * FROM cursors WHERE id = ?', [id])
}

export function getCursorsWithPrefix(prefix: string): Promise<Cursor[]> {
  return getDb().getAllAsync<Cursor>("SELECT * FROM cursors WHERE id LIKE ? || '%'", [prefix])
}

export async function setCursor(id: string, position: string): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd')
  await getDb().runAsync(
    `INSERT INTO cursors (id, position, started_at) VALUES (?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET position = excluded.position`,
    [id, position, today],
  )
}

export async function ensureCursor(id: string, defaultPosition: string): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd')
  await getDb().runAsync(
    'INSERT OR IGNORE INTO cursors (id, position, started_at) VALUES (?, ?, ?)',
    [id, defaultPosition, today],
  )
}

export async function advanceIndex(id: string, entryCount: number): Promise<void> {
  if (entryCount <= 0) return
  await getDb().runAsync(
    `UPDATE cursors SET position = json_set(position, '$.index',
       (json_extract(position, '$.index') + 1) % ?)
     WHERE id = ?`,
    [entryCount, id],
  )
}

export async function setIndex(id: string, index: number): Promise<void> {
  await getDb().runAsync(
    "UPDATE cursors SET position = json_set(position, '$.index', ?) WHERE id = ?",
    [index, id],
  )
}

// --- Program cursors ---

export type ProgramCursorPosition = {
  day: number
  status: 'active' | 'completed'
}

function programCursorId(practiceId: string): string {
  return `program/${practiceId}`
}

export function getProgramCursor(practiceId: string): Promise<Cursor | null> {
  return getCursor(programCursorId(practiceId))
}

export function parseProgramPosition(cursor: Cursor): ProgramCursorPosition {
  return JSON.parse(cursor.position) as ProgramCursorPosition
}

export async function createProgramCursor(practiceId: string): Promise<void> {
  await setCursor(programCursorId(practiceId), JSON.stringify({ day: 0, status: 'active' }))
}

export async function restartProgram(practiceId: string, today?: string): Promise<void> {
  const id = programCursorId(practiceId)
  const date = today ?? format(new Date(), 'yyyy-MM-dd')
  await getDb().runAsync(
    "UPDATE cursors SET position = json_set(json_set(position, '$.day', 0), '$.status', 'active'), started_at = ? WHERE id = ?",
    [date, id],
  )
}
