import type { MealSlot } from '@/db/events/types'

export const mealSlots: readonly MealSlot[] = ['breakfast', 'lunch', 'dinner']

const windows: Record<MealSlot, [number, number]> = {
  breakfast: [6, 10],
  lunch: [11, 14],
  dinner: [17, 21],
}

// `now` must be a real Date (`new Date()`), not `useToday()` — the latter is
// normalized to midnight, which would always fall outside every slot window.
export function currentMealSlot(now: Date): MealSlot | undefined {
  const hour = now.getHours()
  for (const slot of mealSlots) {
    const [start, end] = windows[slot]
    if (hour >= start && hour < end) return slot
  }
  return undefined
}
