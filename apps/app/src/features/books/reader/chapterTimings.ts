import { chapterTimingsCursorId, getCursor, setCursor } from '@/db/repositories/cursors'
import { stripHtml } from '@/lib/html'

const WORDS_PER_MINUTE = 200

export type ChapterTiming = {
  /** Word count after stripping HTML. */
  words: number
  /** Estimated minutes at 200 wpm, rounded up. */
  minutes: number
}

export function estimateChapterTiming(html: string | undefined): ChapterTiming {
  if (!html) return { words: 0, minutes: 0 }
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) }
}

/** Map chapterId → timing for the leaf chapters in reading order. */
export function buildChapterTimings(
  bodies: string[] | undefined,
  ids: string[],
): Map<string, ChapterTiming> | undefined {
  if (!bodies) return undefined
  const map = new Map<string, ChapterTiming>()
  for (let i = 0; i < ids.length; i++) {
    map.set(ids[i], estimateChapterTiming(bodies[i]))
  }
  return map
}

type StoredTimings = {
  /** Per-chapter minutes, keyed by leaf id. */
  byChapter: Record<string, number>
  /** Computed-at unix ms (so we can recompute if older than X). */
  at: number
}

export async function persistChapterTimings(
  bookId: string,
  timings: Map<string, ChapterTiming>,
): Promise<void> {
  const byChapter: Record<string, number> = {}
  for (const [id, t] of timings) byChapter[id] = t.minutes
  const stored: StoredTimings = { byChapter, at: Date.now() }
  await setCursor(chapterTimingsCursorId(bookId), JSON.stringify(stored))
}

/** Load per-chapter minutes for the frontispiece. Undefined when none stored. */
export function loadChapterMinutes(bookId: string): Record<string, number> | undefined {
  const c = getCursor(chapterTimingsCursorId(bookId))
  if (!c) return undefined
  try {
    const v = JSON.parse(c.position) as StoredTimings
    if (v?.byChapter && typeof v.byChapter === 'object') return v.byChapter
  } catch (err) {
    console.warn(`[chapterTimings] could not parse ${bookId}:`, err)
  }
  return undefined
}
