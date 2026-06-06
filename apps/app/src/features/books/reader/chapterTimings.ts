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
