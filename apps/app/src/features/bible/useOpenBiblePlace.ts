import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useBibleStore } from '@/stores/bibleStore'

/** Opens the reader at a place: the reader shows wherever the store points. */
export function useOpenBiblePlace() {
  const router = useRouter()
  return useCallback(
    (bookId: string, chapter: number) => {
      useBibleStore.getState().setPosition(bookId, chapter)
      router.push('/bible/reader')
    },
    [router],
  )
}
