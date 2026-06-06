import {
  bookmarkCursorId,
  bookmarkCursorPrefix,
  getCursorsWithPrefix,
  setCursor,
} from '@/db/repositories/cursors'
import type { ReaderPosition } from './useReaderCursor'

export type Bookmark = {
  cursorId: string
  chapterId: string
  fraction: number
  createdAt: number
  /** Chapter title at the time of bookmarking; cached for display. */
  label?: string
}

export async function addBookmark(
  bookId: string,
  position: ReaderPosition,
  label?: string,
): Promise<void> {
  const createdAt = Date.now()
  await setCursor(
    bookmarkCursorId(bookId, createdAt),
    JSON.stringify({ ...position, createdAt, label }),
  )
}

export function listBookmarks(bookId: string): Bookmark[] {
  const cursors = getCursorsWithPrefix(bookmarkCursorPrefix(bookId))
  const out: Bookmark[] = []
  for (const c of cursors) {
    try {
      const pos = JSON.parse(c.position) as ReaderPosition & {
        createdAt?: number
        label?: string
      }
      if (!pos.chapterId) continue
      out.push({
        cursorId: c.id,
        chapterId: pos.chapterId,
        fraction: typeof pos.fraction === 'number' ? pos.fraction : 0,
        createdAt: pos.createdAt ?? 0,
        label: pos.label,
      })
    } catch (err) {
      console.warn(`[bookmarks] could not parse ${c.id}:`, err)
    }
  }
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Soft-delete by overwriting the cursor with an empty payload. The events log
 * is append-only and doesn't expose a real delete; `listBookmarks` filters
 * out entries missing a chapterId.
 */
export async function removeBookmark(cursorId: string): Promise<void> {
  await setCursor(cursorId, JSON.stringify({}))
}
