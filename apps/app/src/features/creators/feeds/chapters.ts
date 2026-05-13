/**
 * Chapter-marker parsing.
 *
 * Two sources:
 *   1. The `podcast:chapters` namespace (a JSON URL pointing to a structured
 *      chapters document).
 *   2. Plain-text timestamp lists embedded in <description> — common in
 *      Q&A-style podcasts that list each question and its offset.
 *
 * Per-question deep-linking is the core of the search "wow" — if a feed
 * exposes chapter markers, every question becomes its own searchable
 * timestamped doc.
 */

import type { FeedItemChapter } from '@/db/repositories/feedItems'
import { parseClock } from './xml'

// Match common timestamp formats at the start of a line:
//   00:00 Intro
//   12:34 - Pergunta 1
//   1:02:30 Long lecture
//   [12:34] Question
const LINE_TIMESTAMP = /^\s*\[?\s*((?:\d{1,2}:)?\d{1,2}:\d{2})\s*\]?\s*[-–·:]?\s*(.+?)\s*$/

/**
 * Parse a free-form description for inline timestamps. Strips HTML so feeds
 * with `<p>00:00 Intro</p>` work the same as plain-text lists. Requires at
 * least 2 timestamps to consider a description "chapterized" — single 00:00
 * marks would otherwise produce useless single-chapter results.
 */
export function parseInlineChapters(description: string): FeedItemChapter[] {
  if (!description) return []
  const stripped = description
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')

  const out: FeedItemChapter[] = []
  for (const rawLine of stripped.split(/\r?\n/)) {
    const m = rawLine.match(LINE_TIMESTAMP)
    if (!m) continue
    const tStart = parseClock(m[1])
    if (tStart === undefined) continue
    const title = m[2].trim()
    if (!title || title.length > 200) continue
    out.push({ tStart, title })
  }

  if (out.length < 2) return []

  // Drop chapters whose timestamps are not strictly increasing — protects
  // against false hits inside lyric or schedule blocks.
  const ascending: FeedItemChapter[] = []
  let last = -1
  for (const c of out) {
    if (c.tStart > last) {
      ascending.push(c)
      last = c.tStart
    }
  }
  return ascending.length >= 2 ? ascending : []
}

export type PodcastChaptersDoc = {
  version?: string
  chapters?: { startTime: number; title?: string }[]
}

/** Parse the JSON document referenced by a `podcast:chapters` URL. */
export function parsePodcastChaptersDoc(json: PodcastChaptersDoc): FeedItemChapter[] {
  if (!Array.isArray(json.chapters)) return []
  return json.chapters
    .filter((c) => typeof c.startTime === 'number' && typeof c.title === 'string')
    .map((c) => ({ tStart: c.startTime, title: c.title as string }))
}
