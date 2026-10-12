/**
 * Favorites — the one collection everyone starts with. It has no row of its
 * own: its members are the saved items (`saved_items`), latest first, so the
 * star on a prayer or a book is the whole of its authoring. It opens through
 * the user-collection viewer under a reserved id.
 */

import type { SavedItem } from '@/db/repositories/savedItems'
import { defaultSectionId, type UserCollectionItem } from '@/db/repositories/userCollections'
import { toneForKey } from '@/features/explore/bgColor'

export const favoritesId = 'favorites'
export const favoritesTone = toneForKey(favoritesId)

// A collection that is saved is shelved beside the user's own, not favorited.
export function isFavoritable(ref: string): boolean {
  return !ref.startsWith('collection/') && !ref.startsWith('usercollection/')
}

export function favoriteItems(saved: SavedItem[]): UserCollectionItem[] {
  return saved
    .filter((s) => isFavoritable(s.itemId))
    .map((s, position) => ({
      collectionId: favoritesId,
      ref: s.itemId,
      sectionId: defaultSectionId,
      position,
      addedAt: s.savedAt,
    }))
}
