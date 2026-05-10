/**
 * Wire feed-item pinning + auto-pin reconciliation at app boot. Called once
 * from `_layout.tsx` after the DB is ready.
 */

import { getFollow } from '@/db/repositories/creators'
import { getPreference } from '@/db/repositories/preferences'
import { onPostRefresh } from '@/features/creators/feeds/fetcher'
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
}
