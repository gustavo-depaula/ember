/**
 * Generic blog RSS / Atom parser. Used for text feeds (no media enclosure).
 * Dispatches on the root element so a single parser handles both shapes.
 */

import { attrOf, parseDate, pickFirst, textOf, xmlParser } from './xml'

export type RssDraft = {
  guid: string
  title: string
  summary?: string
  publishedAt: number
  webUrl?: string
  imageUrl?: string
}

export function parseRssFeed(xml: string): RssDraft[] {
  const parsed = xmlParser.parse(xml) as Record<string, unknown>
  if (parsed.rss) return parseRss20(parsed.rss as Record<string, unknown>)
  if (parsed.feed) return parseAtom(parsed.feed as Record<string, unknown>)
  return []
}

function parseRss20(rss: Record<string, unknown>): RssDraft[] {
  const channel = rss.channel as Record<string, unknown> | undefined
  if (!channel) return []
  const items = ((channel.item ?? []) as Record<string, unknown>[]) || []
  const out: RssDraft[] = []
  for (const item of items) {
    const guidRaw = item.guid
    const guid = typeof guidRaw === 'string' ? guidRaw : textOf(guidRaw) || textOf(item.link)
    const title = textOf(item.title)
    if (!guid || !title) continue
    out.push({
      guid,
      title,
      summary:
        textOf(item['content:encoded']) ||
        textOf(item.description) ||
        textOf(item.summary) ||
        undefined,
      publishedAt: parseDate(textOf(item.pubDate) || textOf(item.published)) ?? 0,
      webUrl: textOf(item.link) || undefined,
      imageUrl: extractRssItemImage(item),
    })
  }
  return out
}

function extractRssItemImage(item: Record<string, unknown>): string | undefined {
  const enclosure = pickFirst(item.enclosure as Record<string, unknown> | undefined)
  if (enclosure) {
    const type = attrOf(enclosure, 'type')
    if (type?.startsWith('image/')) return attrOf(enclosure, 'url')
  }
  const mediaContent = pickFirst(item['media:content'] as Record<string, unknown> | undefined)
  if (mediaContent && attrOf(mediaContent, 'medium') === 'image') {
    return attrOf(mediaContent, 'url')
  }
  return undefined
}

function parseAtom(feed: Record<string, unknown>): RssDraft[] {
  const entries = ((feed.entry ?? []) as Record<string, unknown>[]) || []
  const out: RssDraft[] = []
  for (const entry of entries) {
    const guid = textOf(entry.id)
    const title = textOf(entry.title)
    if (!guid || !title) continue

    const link = pickFirst(entry.link as Record<string, unknown> | string | undefined)
    const webUrl = attrOf(link, 'href') || textOf(link)

    out.push({
      guid,
      title,
      summary: textOf(entry.summary) || textOf(entry.content) || undefined,
      publishedAt: parseDate(textOf(entry.published) || textOf(entry.updated)) ?? 0,
      webUrl: webUrl ?? undefined,
      imageUrl: undefined,
    })
  }
  return out
}
