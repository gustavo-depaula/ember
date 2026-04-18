import type { AngelusSlot } from '@/db/events/types'

export const angelusSlots: readonly AngelusSlot[] = ['morning', 'noon', 'evening']

// Canonical Angelus hours: 6am, noon, 6pm. A one-hour window on either side
// is generous enough that the whisper catches a realistic prayer time.
const windows: Record<AngelusSlot, [number, number]> = {
  morning: [5, 7],
  noon: [11, 13],
  evening: [17, 19],
}

// `now` must be a real Date (`new Date()`), not `useToday()` — the latter is
// normalized to midnight, which would always fall outside every slot window.
export function currentAngelusSlot(now: Date): AngelusSlot | undefined {
  const hour = now.getHours()
  for (const slot of angelusSlots) {
    const [start, end] = windows[slot]
    if (hour >= start && hour < end) return slot
  }
  return undefined
}

export function isAngelusWindow(now: Date): boolean {
  return currentAngelusSlot(now) !== undefined
}
