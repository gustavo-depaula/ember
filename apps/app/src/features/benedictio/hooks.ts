import { useMutation } from '@tanstack/react-query'

import { useEventStore } from '@/db/events'
import type { MealSlot } from '@/db/events/types'
import { blessMeal, revokeMealBlessing } from '@/db/repositories'
import { useCurrentHour } from '@/hooks/useCurrentHour'

import { currentMealSlot } from './slots'

export function useMealBlessedAt(date: string, slot: MealSlot): number | undefined {
  return useEventStore((s) => s.mealsBlessed.get(`${date}:${slot}`))
}

export function useCurrentMealSlot(): MealSlot | undefined {
  return currentMealSlot(useCurrentHour())
}

export function useBlessMeal() {
  return useMutation({
    mutationFn: ({ date, slot }: { date: string; slot: MealSlot }) => blessMeal(date, slot),
  })
}

export function useRevokeMealBlessing() {
  return useMutation({
    mutationFn: ({ date, slot }: { date: string; slot: MealSlot }) =>
      revokeMealBlessing(date, slot),
  })
}
