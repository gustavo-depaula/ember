import type { Href } from 'expo-router'

import { bareId } from '@/content/contentIndex'
import type { FeedItemRow } from '@/features/creators/db/feedItems'

// The module's screens are mounted by route files the host app owns (see
// `index.ts`). Typed routes only know mounted files, so the module builds its
// hrefs here, untyped, in one place — it compiles whether or not it's plugged in.

export const creatorsHref = '/creators' as Href

export function creatorHref(creatorId: string): Href {
  return `/creators/${bareId(creatorId)}` as Href
}

export function episodeHref(creatorId: string, itemId: string): Href {
  return `/creators/${bareId(creatorId)}/episode/${itemId}` as Href
}

export function feedItemHref(item: FeedItemRow): Href {
  const creatorId = bareId(item.creatorId)
  if (item.channelKind === 'youtube' || item.channelKind === 'youtube-short') {
    return `/creators/${creatorId}/video/${item.itemId}` as Href
  }
  if (item.channelKind === 'rss') return `/creators/${creatorId}/article/${item.itemId}` as Href
  return episodeHref(creatorId, item.itemId)
}
