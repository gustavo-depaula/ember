import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { useEventStore } from '@/db/events'
import type { AngelusSlot } from '@/db/events/types'
import { prayAngelus, revokeAngelus } from '@/db/repositories'

import { currentAngelusSlot } from './slots'

export function useAngelusPrayedAt(date: string, slot: AngelusSlot): number | undefined {
  return useEventStore((s) => s.angelusPrayed.get(`${date}:${slot}`))
}

export function useCurrentAngelusSlot(): AngelusSlot | undefined {
  const [slot, setSlot] = useState<AngelusSlot | undefined>(() => currentAngelusSlot(new Date()))
  useEffect(() => {
    const id = setInterval(() => setSlot(currentAngelusSlot(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])
  return slot
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
