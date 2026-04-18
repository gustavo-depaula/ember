import type { MealSlot } from '@/db/events/types'

export const mealSlots: readonly MealSlot[] = ['breakfast', 'lunch', 'dinner']

const windows: Record<MealSlot, [number, number]> = {
  breakfast: [6, 10],
  lunch: [11, 14],
  dinner: [17, 21],
}

export function currentMealSlot(hour: number): MealSlot | undefined {
  for (const slot of mealSlots) {
    const [start, end] = windows[slot]
    if (hour >= start && hour < end) return slot
  }
  return undefined
}
