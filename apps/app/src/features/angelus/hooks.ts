import { useMutation } from '@tanstack/react-query'

import { useEventStore } from '@/db/events'
import type { AngelusSlot } from '@/db/events/types'
import { prayAngelus, revokeAngelus } from '@/db/repositories'
import { useCurrentHour } from '@/hooks/useCurrentHour'

import { currentAngelusSlot } from './slots'

export function useAngelusPrayedAt(date: string, slot: AngelusSlot): number | undefined {
  return useEventStore((s) => s.angelusPrayed.get(`${date}:${slot}`))
}

export function useCurrentAngelusSlot(): AngelusSlot | undefined {
  return currentAngelusSlot(useCurrentHour())
}

export function usePrayAngelus() {
  return useMutation({
    mutationFn: ({ date, slot }: { date: string; slot: AngelusSlot }) => prayAngelus(date, slot),
  })
}

export function useRevokeAngelus() {
  return useMutation({
    mutationFn: ({ date, slot }: { date: string; slot: AngelusSlot }) => revokeAngelus(date, slot),
  })
}
