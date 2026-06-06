import {
  getCursor,
  getCursorsWithPrefix,
  highlightCursorId,
  highlightCursorPrefix,
  setCursor,
} from '@/db/repositories/cursors'
import type { HighlightAnchor } from './highlightAnchor'

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple'

export type Highlight = {
  cursorId: string
  chapterId: string
  anchor: HighlightAnchor
  text: string
  color: HighlightColor
  note?: string
  createdAt: number
  updatedAt?: number
}

type StoredHighlight = Omit<Highlight, 'cursorId'>

export async function addHighlight(
  bookId: string,
  highlight: Omit<StoredHighlight, 'createdAt'>,
): Promise<Highlight> {
  const createdAt = Date.now()
  const payload: StoredHighlight = { ...highlight, createdAt }
  const cursorId = highlightCursorId(bookId, createdAt)
  await setCursor(cursorId, JSON.stringify(payload))
  return { ...payload, cursorId }
}

export async function updateHighlight(
  cursorId: string,
  patch: Partial<Pick<StoredHighlight, 'color' | 'note'>>,
): Promise<void> {
  const c = getCursor(cursorId)
  if (!c) return
  const existing = JSON.parse(c.position) as StoredHighlight
  const merged: StoredHighlight = { ...existing, ...patch, updatedAt: Date.now() }
  await setCursor(cursorId, JSON.stringify(merged))
}

export function listHighlights(bookId: string): Highlight[] {
  const cursors = getCursorsWithPrefix(highlightCursorPrefix(bookId))
  const out: Highlight[] = []
  for (const c of cursors) {
    try {
      const raw = JSON.parse(c.position) as Partial<StoredHighlight>
      if (!raw.chapterId || !raw.anchor || !raw.text || !raw.color) continue
      out.push({
        cursorId: c.id,
        chapterId: raw.chapterId,
        anchor: raw.anchor,
        text: raw.text,
        color: raw.color,
        note: raw.note,
        createdAt: raw.createdAt ?? 0,
        updatedAt: raw.updatedAt,
      })
    } catch (err) {
      console.warn(`[highlights] could not parse ${c.id}:`, err)
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Soft-delete: overwrite with an empty payload. The events log is
 * append-only and doesn't expose a real delete; `listHighlights` filters out
 * entries missing required fields.
 */
export async function removeHighlight(cursorId: string): Promise<void> {
  await setCursor(cursorId, JSON.stringify({}))
}
