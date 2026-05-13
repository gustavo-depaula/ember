/**
 * Podcast RSS / Atom parser. Handles the standard RSS 2.0 + iTunes namespace
 * + podcast namespace fields we care about for episode listings and chapter
 * markers.
 */

import { parseInlineChapters } from './chapters'
import { attrOf, parseClock, parseDate, pickFirst, textOf, xmlParser } from './xml'

export type PodcastDraft = {
  guid: string
  title: string
  summary?: string
  publishedAt: number
  durationS?: number
  mediaUrl?: string
  webUrl?: string
  imageUrl?: string
  chapters?: { tStart: number; title: string }[]
  chaptersUrl?: string
}

export type PodcastFeedResult = {
  items: PodcastDraft[]
  /** Channel-level <itunes:image>/<image>. Stable across episodes; used as the creator avatar. */
  channelImage?: string
}

// iTunes duration may be plain seconds, "MM:SS", or "HH:MM:SS".
function parseDuration(value: string): number | undefined {
  if (!value) return undefined
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10)
  return parseClock(value)
}

export function parsePodcastFeed(xml: string): PodcastFeedResult {
  let parsed: Record<string, unknown>
  try {
    parsed = xmlParser.parse(xml) as Record<string, unknown>
  } catch {
    return { items: [] }
  }
  const channel = (parsed.rss as Record<string, unknown> | undefined)?.channel as
    | Record<string, unknown>
    | undefined
  if (!channel) return { items: [] }
  const channelImage =
    attrOf(channel['itunes:image'], 'href') ??
    textOf((channel.image as { url?: unknown } | undefined)?.url) ??
    ''
  const items = (channel.item ?? []) as Record<string, unknown>[]
  const out: PodcastDraft[] = []
  for (const item of items) {
    const draft = parseItem(item, channelImage)
    if (draft) out.push(draft)
  }
  return { items: out, channelImage: channelImage || undefined }
}

function parseItem(item: Record<string, unknown>, channelImage: string): PodcastDraft | undefined {
  const guidRaw = item.guid
  const guid = typeof guidRaw === 'string' ? guidRaw : textOf(guidRaw)
  const title = textOf(item.title)
  if (!guid || !title) return undefined

  const enclosure = pickFirst(item.enclosure as Record<string, unknown> | undefined)
  const mediaUrl = enclosure ? attrOf(enclosure, 'url') : undefined

  const itunesImage = item['itunes:image']
  const imageUrl =
    attrOf(itunesImage, 'href') ||
    textOf((item.image as Record<string, unknown> | undefined)?.url) ||
    channelImage

  const description =
    textOf(item['content:encoded']) || textOf(item.description) || textOf(item.summary)

  const chapters = parseInlineChapters(description)

  const chaptersNode = pickFirst(item['podcast:chapters'] as Record<string, unknown> | undefined)
  const chaptersUrl = chaptersNode ? attrOf(chaptersNode, 'url') : undefined

  return {
    guid,
    title,
    summary: description || undefined,
    publishedAt: parseDate(textOf(item.pubDate) || textOf(item.published)) ?? 0,
    durationS: parseDuration(textOf(item['itunes:duration'])),
    mediaUrl,
    webUrl: textOf(item.link) || undefined,
    imageUrl: imageUrl || undefined,
    chapters: chapters.length ? chapters : undefined,
    chaptersUrl: chaptersUrl || undefined,
  }
}
