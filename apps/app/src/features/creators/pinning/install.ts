/**
 * Wire feed-item pinning + auto-pin reconciliation at app boot, and plug the
 * creator catalog kind + downloaded feed media into the pinning manager's
 * walk and GC. Called once from `startCreators` after the DB is ready.
 */

import type { CreatorManifest } from '@/content/manifestTypes'
import { getPreference } from '@/db/repositories/preferences'
import { getFollow } from '@/features/creators/db/creators'
import { pinnedFeedItemHashes } from '@/features/creators/db/feedItems'
import { onPostRefresh } from '@/features/creators/feeds/fetcher'
import { registerPinCollector, registerPinnedHashSource } from '@/features/pinning/pinningManager'
import { getNetworkStateNow } from '@/lib/network'

import { installFeedItemPinDeps, reconcileAutoPins } from './feedItemPin'
import { downloadMediaUrl } from './mediaDownload'

export function installCreatorPinning(): void {
  installFeedItemPinDeps({
    network: getNetworkStateNow,
    preferenceGet: getPreference,
    download: downloadMediaUrl,
  })
  onPostRefresh(async (creatorId) => {
    const follow = await getFollow(creatorId)
    if (!follow || follow.autoPinCount === 0) return
    await reconcileAutoPins(creatorId, follow.autoPinCount)
  })
  registerPinCollector('creator', (body, add) => {
    const c = body as CreatorManifest
    if (c.avatarHash) add(c.avatarHash)
    if (c.bannerHash) add(c.bannerHash)
    return []
  })
  registerPinnedHashSource(pinnedFeedItemHashes)
}
