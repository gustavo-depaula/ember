import type { Href } from 'expo-router'

import { bareId, ensureManifestBody, getEntry } from '@/content/contentIndex'

export function collectionHref(id: string): Href {
  return { pathname: '/browse/[collectionId]', params: { collectionId: bareId(id) } }
}

// Warm the manifest while the navigation transition runs, so the collection
// screen has its sections ready instead of waiting on the background warmer.
export function warmCollection(id: string): void {
  const entry = getEntry(id)
  if (entry) void ensureManifestBody(entry.hash).catch(() => {})
}
