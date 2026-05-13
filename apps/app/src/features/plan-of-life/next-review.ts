import { addDays } from 'date-fns'

import type { SlotState } from '@/db/events'

import { isApplicableOn, parseSchedule } from './schedule'

const REVIEW_PRACTICE_IDS = new Set(['examination-of-conscience'])

export type NextReview = {
  practiceId: string
  date: Date
}

export function nextReviewDate(slots: SlotState[], now: Date): NextReview | undefined {
  const reviewSlots = slots.filter((s) => s.enabled === 1 && REVIEW_PRACTICE_IDS.has(s.practice_id))
  if (reviewSlots.length === 0) return undefined

  let best: NextReview | undefined
  for (const slot of reviewSlots) {
    const schedule = parseSchedule(slot.schedule)
    for (let offset = 0; offset < 31; offset++) {
      const candidate = addDays(now, offset)
      if (isApplicableOn(schedule, candidate)) {
        const date = applyTime(candidate, slot.time)
        if (date.getTime() <= now.getTime()) continue
        if (!best || date.getTime() < best.date.getTime()) {
          best = { practiceId: slot.practice_id, date }
        }
        break
      }
    }
  }
  return best
}

function applyTime(date: Date, time: string | null): Date {
  const result = new Date(date)
  if (time) {
    const [h, m] = time.split(':').map(Number)
    result.setHours(h ?? 20, m ?? 0, 0, 0)
  } else {
    result.setHours(20, 0, 0, 0)
  }
  return result
}
