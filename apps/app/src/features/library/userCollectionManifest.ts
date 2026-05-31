/**
 * Assemble a `CollectionItemManifest` from local user-collection rows, so a
 * user collection renders through the exact same viewer (CollectionHero +
 * SectionList + CollectionTile) as a corpus collection. User-authored names
 * aren't translatable, so they're wrapped under the 'en-US' slot — which
 * `localizeContent` falls back to for any active language.
 */

import type { CollectionBlock, CollectionItemManifest } from '@/content/manifestTypes'
import type { LocalizedText } from '@/content/types'
import type { UserCollection, UserCollectionItem } from '@/db/repositories/userCollections'

export function userCollectionRef(id: string): string {
  return `usercollection/${id}`
}

function plain(text: string | undefined): LocalizedText | undefined {
  return text ? { 'en-US': text } : undefined
}

export function buildUserCollectionManifest(
  collection: UserCollection,
  items: UserCollectionItem[],
): CollectionItemManifest {
  // v1: a single untitled section. The empty title lets SectionView render a
  // flat jewel grid with no fleuron heading.
  const blocks: CollectionBlock[] = items.map((it) => ({
    kind: 'item',
    ref: it.ref,
    label: plain(it.label),
  }))

  return {
    id: userCollectionRef(collection.id),
    name: plain(collection.name),
    description: plain(collection.description),
    sections: [{ id: 'default', title: { 'en-US': '' }, blocks }],
  }
}
