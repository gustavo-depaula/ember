import type { AngelusSlot } from '@/db/events/types'

export const angelusSlots: readonly AngelusSlot[] = ['morning', 'noon', 'evening']

// Canonical Angelus hours: 6am, noon, 6pm. A one-hour window on either side
// is generous enough that the whisper catches a realistic prayer time.
const windows: Record<AngelusSlot, [number, number]> = {
  morning: [5, 7],
  noon: [11, 13],
  evening: [17, 19],
}

export function currentAngelusSlot(hour: number): AngelusSlot | undefined {
  for (const slot of angelusSlots) {
    const [start, end] = windows[slot]
    if (hour >= start && hour < end) return slot
  }
  return undefined
}

export function isAngelusWindow(hour: number): boolean {
  return currentAngelusSlot(hour) !== undefined
}
