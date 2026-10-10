/**
 * Collections the user authors. They serialize to the same
 * `CollectionItemManifest` as corpus collections and render through the same
 * viewer; only storage + authoring live here.
 *
 * A collection is its metadata plus an ordered list of member refs. Every
 * member sits in one implicit `'default'` section; `sectionId` leaves room for
 * multi-section authoring.
 */

import { randomId } from '@/lib/id'
import { emit, useEventStore } from '../events'
import type { CollectionState } from '../events/state'
import type { UserCollection, UserCollectionItem } from '../schema'

export type { UserCollection, UserCollectionItem }

export const defaultSectionId = 'default'

function collections() {
  return useEventStore.getState().collections
}

function withoutRefs({ refs: _refs, ...collection }: CollectionState): UserCollection {
  return collection
}

export async function createUserCollection(input: {
  name: string
  description?: string
  coverTone?: number
}): Promise<string> {
  const id = randomId()
  await emit({
    type: 'CollectionCreated',
    collectionId: id,
    name: input.name,
    description: input.description,
    coverTone: input.coverTone ?? 0,
    at: Date.now(),
  })
  return id
}

export async function renameUserCollection(
  id: string,
  name: string,
  description?: string,
): Promise<void> {
  await emit({
    type: 'CollectionUpdated',
    collectionId: id,
    name,
    description: description ?? null,
    at: Date.now(),
  })
}

export async function setUserCollectionTone(id: string, coverTone: number): Promise<void> {
  await emit({ type: 'CollectionUpdated', collectionId: id, coverTone, at: Date.now() })
}

export async function deleteUserCollection(id: string): Promise<void> {
  await emit({ type: 'CollectionDeleted', collectionId: id })
}

export async function getUserCollection(id: string): Promise<UserCollection | undefined> {
  const found = collections().get(id)
  return found && withoutRefs(found)
}

export async function getUserCollections(): Promise<UserCollection[]> {
  return [...collections().values()].map(withoutRefs).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getUserCollectionItems(id: string): Promise<UserCollectionItem[]> {
  const refs = collections().get(id)?.refs ?? []
  return refs.map(({ ref, addedAt }, position) => ({
    collectionId: id,
    ref,
    sectionId: defaultSectionId,
    position,
    addedAt,
  }))
}

export async function addItemToCollection(id: string, ref: string): Promise<void> {
  if (
    collections()
      .get(id)
      ?.refs.some((r) => r.ref === ref)
  )
    return
  await emit({ type: 'CollectionItemAdded', collectionId: id, ref, at: Date.now() })
}

export async function removeItemFromCollection(id: string, ref: string): Promise<void> {
  await emit({ type: 'CollectionItemRemoved', collectionId: id, ref, at: Date.now() })
}

export async function reorderCollectionItems(id: string, orderedRefs: string[]): Promise<void> {
  await emit({ type: 'CollectionItemsReordered', collectionId: id, orderedRefs, at: Date.now() })
}

/** Collection ids whose members include `ref` — drives the Add-to-collection checks. */
export async function getCollectionsContainingRef(ref: string): Promise<string[]> {
  return [...collections().values()]
    .filter((collection) => collection.refs.some((r) => r.ref === ref))
    .map((collection) => collection.id)
}
