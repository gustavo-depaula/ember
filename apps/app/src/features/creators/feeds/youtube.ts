/**
 * YouTube channel parser. Reads the public Atom feed at
 * `https://www.youtube.com/feeds/videos.xml?channel_id=…` — no API key, no
 * quota. Duration is omitted by this endpoint; the iframe player surfaces it
 * once playback starts.
 */

import { parseInlineChapters } from './chapters'
import { attrOf, parseDate, pickFirst, textOf, xmlParser } from './xml'

export type YoutubeDraft = {
  guid: string
  title: string
  summary?: string
  publishedAt: number
  webUrl?: string
  imageUrl?: string
  videoId: string
  chapters?: { tStart: number; title: string }[]
}

export function parseYoutubeFeed(xml: string): YoutubeDraft[] {
  const parsed = xmlParser.parse(xml) as Record<string, unknown>
  const feed = parsed.feed as Record<string, unknown> | undefined
  if (!feed) return []
  const entries = ((feed.entry ?? []) as Record<string, unknown>[]) || []
  const out: YoutubeDraft[] = []
  for (const e of entries) {
    const draft = parseEntry(e)
    if (draft) out.push(draft)
  }
  return out
}

function parseEntry(entry: Record<string, unknown>): YoutubeDraft | undefined {
  const videoId = textOf(entry['yt:videoId'])
  const title = textOf(entry.title)
  if (!videoId || !title) return undefined

  const webUrl = attrOf(pickFirst(entry.link as Record<string, unknown> | undefined), 'href')

  const mediaGroup = entry['media:group'] as Record<string, unknown> | undefined
  const description = textOf(mediaGroup?.['media:description'])
  const imageUrl = attrOf(
    pickFirst(mediaGroup?.['media:thumbnail'] as Record<string, unknown> | undefined),
    'url',
  )

  const chapters = parseInlineChapters(description)

  return {
    guid: videoId,
    title,
    summary: description || undefined,
    publishedAt: parseDate(textOf(entry.published)) ?? 0,
    webUrl: webUrl ?? `https://www.youtube.com/watch?v=${videoId}`,
    imageUrl: imageUrl || undefined,
    videoId,
    chapters: chapters.length ? chapters : undefined,
  }
}
