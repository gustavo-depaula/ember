/**
 * User-collection hooks. Reads return built `CollectionItemManifest`s so the
 * viewer is shared with corpus collections; writes invalidate the relevant
 * queries. Creating a collection auto-saves it to the library shelf; deleting
 * removes it from the shelf too.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { saveItem, unsaveItem } from '@/db/repositories/savedItems'
import {
  addItemToCollection,
  createUserCollection,
  deleteUserCollection,
  getCollectionsContainingRef,
  getUserCollection,
  getUserCollectionItems,
  getUserCollections,
  removeItemFromCollection,
  renameUserCollection,
  reorderCollectionItems,
  setUserCollectionTone,
} from '@/db/repositories/userCollections'

import { buildUserCollectionManifest, userCollectionRef } from './userCollectionManifest'

export function useUserCollections() {
  return useQuery({
    queryKey: ['user-collections'],
    queryFn: () => getUserCollections(),
  })
}

export function useUserCollection(id: string | undefined) {
  return useQuery({
    queryKey: ['user-collection', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return undefined
      const [collection, items] = await Promise.all([
        getUserCollection(id),
        getUserCollectionItems(id),
      ])
      if (!collection) return undefined
      return { collection, items, manifest: buildUserCollectionManifest(collection, items) }
    },
  })
}

export function useCollectionsContainingRef(ref: string | undefined) {
  return useQuery({
    queryKey: ['ref-collections', ref],
    enabled: !!ref,
    queryFn: () => (ref ? getCollectionsContainingRef(ref) : []),
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: ['user-collections'] })
    qc.invalidateQueries({ queryKey: ['saved-items'] })
    qc.invalidateQueries({ queryKey: ['ref-collections'] })
    if (id) qc.invalidateQueries({ queryKey: ['user-collection', id] })
  }
}

export function useCreateUserCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; coverTone?: number }) => {
      const id = await createUserCollection(input)
      await saveItem(userCollectionRef(id), 'usercollection')
      return id
    },
    onSuccess: (id) => invalidate(id),
  })
}

export function useRenameUserCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string; name: string; description?: string }) =>
      renameUserCollection(input.id, input.name, input.description),
    onSuccess: (_r, input) => invalidate(input.id),
  })
}

export function useSetUserCollectionTone() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string; coverTone: number }) =>
      setUserCollectionTone(input.id, input.coverTone),
    onSuccess: (_r, input) => invalidate(input.id),
  })
}

export function useDeleteUserCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteUserCollection(id)
      await unsaveItem(userCollectionRef(id))
    },
    onSuccess: (_r, id) => invalidate(id),
  })
}

export function useAddToCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { collectionId: string; ref: string }) =>
      addItemToCollection(input.collectionId, input.ref),
    onSuccess: (_r, input) => invalidate(input.collectionId),
  })
}

export function useRemoveFromCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { collectionId: string; ref: string }) =>
      removeItemFromCollection(input.collectionId, input.ref),
    onSuccess: (_r, input) => invalidate(input.collectionId),
  })
}

export function useReorderCollection() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { collectionId: string; orderedRefs: string[] }) =>
      reorderCollectionItems(input.collectionId, input.orderedRefs),
    onSuccess: (_r, input) => invalidate(input.collectionId),
  })
}
