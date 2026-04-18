import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import type { GratitudeState } from '@/db/events/state'
import { addGratitude, removeGratitude } from '@/db/repositories'

export function useGratitudes(): GratitudeState[] {
  return useEventStore(
    useShallow((s) => [...s.gratitudes.values()].sort((a, b) => b.recorded_at - a.recorded_at)),
  )
}

export function useGratitudesCount(): number {
  return useEventStore((s) => s.gratitudes.size)
}

export function useAddGratitude() {
  return useMutation({ mutationFn: (text: string) => addGratitude(text) })
}

export function useRemoveGratitude() {
  return useMutation({ mutationFn: (id: number) => removeGratitude(id) })
}
