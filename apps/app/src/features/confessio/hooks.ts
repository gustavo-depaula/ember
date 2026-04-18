import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useEventStore } from '@/db/events'
import type { ConfessionState } from '@/db/events/state'
import { recordConfession, removeConfession } from '@/db/repositories'

export function useConfessions(): ConfessionState[] {
  const confessions = useEventStore((s) => s.confessions)
  return useMemo(
    () => [...confessions.values()].sort((a, b) => b.date.localeCompare(a.date)),
    [confessions],
  )
}

export function useLastConfession(): ConfessionState | undefined {
  return useConfessions()[0]
}

export function useRecordConfession() {
  return useMutation({ mutationFn: (date: string) => recordConfession(date) })
}

export function useRemoveConfession() {
  return useMutation({ mutationFn: (id: number) => removeConfession(id) })
}
