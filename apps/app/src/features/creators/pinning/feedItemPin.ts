/**
 * Feed-item pinning: download media + image, mark `feed_items.pinned = 1`,
 * and tell the existing pinning manager about the new protected hashes so the
 * next GC pass spares them.
 *
 * Wi-Fi-only is a hard gate — when the user is on cellular and the toggle is
 * on, we enqueue to `pending_pins` instead of silently using the cellular
 * connection. The queue drains on Wi-Fi reconnect.
 */

import {
  type FeedItemRow,
  getAutoPinnedByCreator,
  getFeedItem,
  getFeedItemsByCreator,
  type PinSource,
  setPinned,
} from '@/db/repositories/feedItems'
import { dequeuePin, enqueuePin, getPending } from '@/db/repositories/pendingPins'
import type { NetworkState } from '@/lib/network'

import { computeReconcile } from './reconcile'

export const WIFI_ONLY_PREF_KEY = 'creators.wifiOnly'

type Deps = {
  network: () => Promise<NetworkState>
  preferenceGet: (key: string) => Promise<string | undefined>
  download: (url: string) => Promise<{ hash: string; size: number }>
}

let deps: Deps | undefined

export function installFeedItemPinDeps(d: Deps): void {
  deps = d
}

function requireDeps(): Deps {
  if (!deps) throw new Error('feedItemPin: deps not installed; call installCreatorPinning() first')
  return deps
}

async function isWifiOnly(): Promise<boolean> {
  const raw = await requireDeps().preferenceGet(WIFI_ONLY_PREF_KEY)
  // Default ON: an unset pref means "protect cellular bills".
  return raw !== '0'
}

export type PinResult = 'pinned' | 'deferred' | 'skipped'

export async function pinFeedItem(
  itemId: string,
  source: PinSource = 'manual',
  options: { force?: boolean } = {},
): Promise<PinResult> {
  const item = await getFeedItem(itemId)
  if (!item || !item.mediaUrl) return 'skipped'
  if (item.pinned) return 'skipped'

  const { network, download } = requireDeps()
  if (!options.force) {
    const state = await network()
    if (!state.isOnline) {
      await enqueuePin(itemId)
      return 'deferred'
    }
    if ((await isWifiOnly()) && state.type !== 'wifi') {
      await enqueuePin(itemId)
      return 'deferred'
    }
  }

  const media = await download(item.mediaUrl)
  let imageHash: string | undefined
  if (item.imageUrl) {
    try {
      imageHash = (await download(item.imageUrl)).hash
    } catch {
      // Image is decorative; tolerate failure.
    }
  }

  await setPinned(itemId, true, source, { mediaHash: media.hash, imageHash })
  await dequeuePin(itemId)
  return 'pinned'
}

export async function unpinFeedItem(itemId: string): Promise<void> {
  await setPinned(itemId, false)
  await dequeuePin(itemId)
}

export async function reconcileAutoPins(creatorId: string, autoPinCount: number): Promise<void> {
  if (autoPinCount === 0) {
    const auto = await getAutoPinnedByCreator(creatorId)
    await Promise.all([...auto].map((id) => unpinFeedItem(id)))
    return
  }
  const recent = await getFeedItemsByCreator(creatorId, autoPinCount)
  const auto = await getAutoPinnedByCreator(creatorId)
  const { toPin, toUnpin } = computeReconcile(
    recent.map((r) => ({ itemId: r.itemId })),
    auto,
    autoPinCount,
  )
  await Promise.all([
    ...toPin.map((id) => pinFeedItem(id, 'auto')),
    ...toUnpin.map((id) => unpinFeedItem(id)),
  ])
}

export async function drainPendingPins(): Promise<void> {
  const state = await requireDeps().network()
  if (!state.isOnline) return
  if ((await isWifiOnly()) && state.type !== 'wifi') return
  for (const itemId of await getPending()) {
    try {
      await pinFeedItem(itemId)
    } catch {
      // Best-effort; failed items remain queued.
    }
  }
}

export type { FeedItemRow }
