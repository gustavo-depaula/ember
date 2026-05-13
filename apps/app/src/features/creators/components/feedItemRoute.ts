import { bareId } from '@/content/contentIndex'
import type { FeedItemRow } from '@/db/repositories/feedItems'

export function routeFor(item: FeedItemRow) {
  const creatorId = bareId(item.creatorId)
  if (item.channelKind === 'youtube') {
    return {
      pathname: '/creators/[creatorId]/video/[itemId]' as const,
      params: { creatorId, itemId: item.itemId },
    }
  }
  if (item.channelKind === 'rss') {
    return {
      pathname: '/creators/[creatorId]/article/[itemId]' as const,
      params: { creatorId, itemId: item.itemId },
    }
  }
  return {
    pathname: '/creators/[creatorId]/episode/[itemId]' as const,
    params: { creatorId, itemId: item.itemId },
  }
}
