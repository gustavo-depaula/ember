/**
 * Daily cache maintenance. Eviction needs `pinnedHashes()` (a manifest-tree
 * walk of every pinned item) plus `listCachedBlobs()` (thousands of sync JSI
 * stat calls near the 200MB cap) — far too expensive to run on every launch.
 * The cap is soft, so enforcing it once a day is plenty.
 */

import { Platform } from 'react-native'

import { getPreference, setPreference } from '@/db/repositories/preferences'
import { pinnedHashes } from '@/features/pinning/pinningManager'
import { clearBlobTmp, evictTo } from './store'

// 200MB cap. Pinned blobs are skipped during eviction; the cap is a soft
// ceiling (pinned content can exceed it without dropping anything).
const cacheBudgetBytes = 200 * 1024 * 1024
const evictionIntervalMs = 24 * 60 * 60 * 1000
const lastEvictionKey = 'last-eviction-at'

export async function maybeRunCacheEviction(): Promise<void> {
  if (Platform.OS === 'web') return
  const last = Number(await getPreference(lastEvictionKey)) || 0
  if (Date.now() - last < evictionIntervalMs) return

  await clearBlobTmp()
  const protectedHashes = await pinnedHashes()
  const result = await evictTo(cacheBudgetBytes, protectedHashes)
  if (result.deleted > 0) {
    console.log(
      `[cache] eviction: dropped ${result.deleted} blob(s); now ${(result.totalBytes / 1024 / 1024).toFixed(1)}MB`,
    )
  }
  await setPreference(lastEvictionKey, String(Date.now()))
}
