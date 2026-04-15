import { format } from 'date-fns'

import { getToday } from '@/hooks/useToday'
import { emit, useEventStore } from '../events'
import type { Cursor } from '../schema'

// --- Reads (from in-memory state) ---

export function getCursor(id: string): Cursor | undefined {
  return useEventStore.getState().cursors.get(id)
}

export function getCursorsWithPrefix(prefix: string): Cursor[] {
  const result: Cursor[] = []
  for (const [id, cursor] of useEventStore.getState().cursors) {
    if (id.startsWith(prefix)) result.push(cursor)
  }
  return result
}

// --- Mutations (emit events) ---

export async function setCursor(id: string, position: string): Promise<void> {
  const today = format(getToday(), 'yyyy-MM-dd')
  await emit({ type: 'CursorSet', cursorId: id, position, startedAt: today })
}

export async function ensureCursor(id: string, defaultPosition: string): Promise<void> {
  if (useEventStore.getState().cursors.has(id)) return
  const today = format(getToday(), 'yyyy-MM-dd')
  await emit({ type: 'CursorSet', cursorId: id, position: defaultPosition, startedAt: today })
}

export async function advanceIndex(id: string, entryCount: number): Promise<void> {
  if (entryCount <= 0) return
  const cursor = useEventStore.getState().cursors.get(id)
  if (!cursor) return
  const pos = JSON.parse(cursor.position)
  const newIndex = ((pos.index ?? 0) + 1) % entryCount
  await emit({ type: 'CursorAdvanced', cursorId: id, newIndex })
}

export async function setIndex(id: string, index: number): Promise<void> {
  await emit({ type: 'CursorIndexSet', cursorId: id, index })
}

// --- Program cursors ---

export type ProgramCursorPosition = {
  day: number
  status: 'active' | 'completed'
}

function programCursorId(practiceId: string): string {
  return `program/${practiceId}`
}

export function getProgramCursor(practiceId: string): Cursor | undefined {
  return getCursor(programCursorId(practiceId))
}

export function parseProgramPosition(cursor: Cursor): ProgramCursorPosition {
  return JSON.parse(cursor.position) as ProgramCursorPosition
}

export async function createProgramCursor(practiceId: string): Promise<void> {
  await setCursor(programCursorId(practiceId), JSON.stringify({ day: 0, status: 'active' }))
}

export async function restartProgram(practiceId: string, today?: string): Promise<void> {
  const date = today ?? format(getToday(), 'yyyy-MM-dd')
  await emit({
    type: 'ProgramRestarted',
    cursorId: programCursorId(practiceId),
    practiceId,
    startDate: date,
  })
}
