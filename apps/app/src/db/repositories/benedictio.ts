import { emit, useEventStore } from '../events'
import type { MealSlot } from '../events/types'

export async function blessMeal(date: string, slot: MealSlot): Promise<void> {
  const key = `${date}:${slot}`
  if (useEventStore.getState().mealsBlessed.has(key)) return
  await emit({ type: 'MealBlessed', date, slot, blessedAt: Date.now() })
}

export async function revokeMealBlessing(date: string, slot: MealSlot): Promise<void> {
  const key = `${date}:${slot}`
  if (!useEventStore.getState().mealsBlessed.has(key)) return
  await emit({ type: 'MealBlessingRevoked', date, slot })
}
