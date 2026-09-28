import {
  chapterCompletionId,
  chapterCompletionPrefix,
  getCursorsWithPrefix,
  setCursor,
} from '@/db/repositories/cursors'

/** How far through a chapter counts as having read it. */
export const chapterCompleteFraction = 0.95

export async function markChapterCompleted(bookId: string, chapterId: string): Promise<void> {
  await setCursor(
    chapterCompletionId(bookId, chapterId),
    JSON.stringify({ completedAt: Date.now() }),
  )
}

/**
 * Set of chapter ids the reader has finished in this book (fraction ≥ chapterCompleteFraction
 * at some point in the past). Empty tombstones (soft-deletes) are filtered.
 */
export function listCompletedChapters(bookId: string): Set<string> {
  const prefix = chapterCompletionPrefix(bookId)
  const out = new Set<string>()
  for (const c of getCursorsWithPrefix(prefix)) {
    try {
      const parsed = JSON.parse(c.position) as { completedAt?: number }
      if (typeof parsed.completedAt !== 'number') continue
    } catch {
      continue
    }
    out.add(c.id.slice(prefix.length))
  }
  return out
}
