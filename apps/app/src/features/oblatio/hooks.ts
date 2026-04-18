import { useMutation } from '@tanstack/react-query'

import { useEventStore } from '@/db/events'
import { offerDay, revokeDayOffering } from '@/db/repositories'

export function useDayOffered(date: string): number | undefined {
  return useEventStore((s) => s.offeredDays.get(date))
}

export function useOfferDay() {
  return useMutation({ mutationFn: (date: string) => offerDay(date) })
}

export function useRevokeDayOffering() {
  return useMutation({ mutationFn: (date: string) => revokeDayOffering(date) })
}
