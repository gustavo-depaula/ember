import { differenceInCalendarDays, format, subDays } from 'date-fns'

import type { Completion, Tier, UserPracticeSlot } from '@/db/schema'
import { composeSlotKey } from '@/lib/slotKey'

import { isApplicableOn, parseSchedule } from './schedule'

export function toCompletedSet(completions: Completion[]): Set<string> {
  return new Set(completions.map((c) => composeSlotKey(c.practice_id, c.sub_id!)))
}

export type DayCompletion = {
  date: string
  completed: number
  total: number
}

export function getCurrentStreak(logs: DayCompletion[]): number {
  const byDate = new Map(logs.map((l) => [l.date, l]))
  let streak = 0
  let day = new Date()

  while (true) {
    const key = format(day, 'yyyy-MM-dd')
    const entry = byDate.get(key)
    if (!entry || entry.completed === 0) break
    streak++
    day = subDays(day, 1)
  }

  return streak
}

export function getLongestStreak(logs: DayCompletion[]): number {
  if (logs.length === 0) return 0

  const sorted = [...logs]
    .filter((l) => l.completed > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sorted.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date)
    const curr = new Date(sorted[i].date)
    if (differenceInCalendarDays(curr, prev) === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

export function getCompletionRate(logs: DayCompletion[]): number {
  if (logs.length === 0) return 0
  const totalPossible = logs.reduce((sum, l) => sum + l.total, 0)
  if (totalPossible === 0) return 0
  const totalCompleted = logs.reduce((sum, l) => sum + l.completed, 0)
  return totalCompleted / totalPossible
}

export function getPracticeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sorted = new Set(dates)
  let streak = 0
  let day = new Date()

  while (true) {
    const key = format(day, 'yyyy-MM-dd')
    if (!sorted.has(key)) break
    streak++
    day = subDays(day, 1)
  }

  return streak
}

export function getLongestPracticeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const sorted = [...dates].sort()
  let longest = 1
  let current = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    if (differenceInCalendarDays(curr, prev) === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

// Legacy single-color wall data (kept for individual practice walls)
export function toGreenWallData(
  logs: Array<{ date: string; completed: number }>,
  totalPractices: number,
): Array<{ date: string; value: number }> {
  if (totalPractices === 0) return logs.map((l) => ({ date: l.date, value: 0 }))

  return logs.map((l) => {
    const ratio = l.completed / totalPractices
    const value = (() => {
      if (ratio === 0) return 0
      if (ratio <= 0.25) return 1
      if (ratio <= 0.5) return 2
      if (ratio <= 0.75) return 3
      return 4
    })()
    return { date: l.date, value }
  })
}

// Multi-hue wall data based on tier completion
// Values: 0=empty, 1=extra-partial, 2=extra-full, 3=ideal-partial, 4=ideal-full,
//         5=essential-partial, 6=essential-full, 7=perfect
export type TieredLog = {
  date: string
  practice_id: string
  tier: Tier
}

export function toTieredWallData(
  logs: TieredLog[],
  practicesByTier: { essential: number; ideal: number; extra: number },
): Array<{ date: string; value: number }> {
  const byDate = new Map<string, { essential: number; ideal: number; extra: number }>()

  for (const log of logs) {
    const entry = byDate.get(log.date) ?? { essential: 0, ideal: 0, extra: 0 }
    entry[log.tier]++
    byDate.set(log.date, entry)
  }

  return Array.from(byDate, ([date, counts]) => {
    const essentialsDone =
      practicesByTier.essential > 0 ? counts.essential / practicesByTier.essential : 1
    const idealsDone = practicesByTier.ideal > 0 ? counts.ideal / practicesByTier.ideal : 1
    const extrasDone = practicesByTier.extra > 0 ? counts.extra / practicesByTier.extra : 1

    const allDone = essentialsDone >= 1 && idealsDone >= 1 && extrasDone >= 1

    if (allDone) return { date, value: 7 } // perfect
    if (essentialsDone >= 1) return { date, value: 6 } // essential-full
    if (essentialsDone > 0) return { date, value: 5 } // essential-partial
    if (idealsDone >= 1) return { date, value: 4 } // ideal-full
    if (idealsDone > 0) return { date, value: 3 } // ideal-partial
    if (extrasDone >= 1) return { date, value: 2 } // extra-full
    if (extrasDone > 0) return { date, value: 1 } // extra-partial
    return { date, value: 0 }
  })
}

export function isSlotApplicableOnDate(slot: UserPracticeSlot, date: string): boolean {
  const schedule = parseSchedule(slot.schedule)
  return isApplicableOn(schedule, new Date(date))
}

export function filterSlotsForDate(slots: UserPracticeSlot[], date: string): UserPracticeSlot[] {
  return slots.filter((s) => isSlotApplicableOnDate(s, date))
}

export function countByTier(slots: UserPracticeSlot[]): {
  essential: number
  ideal: number
  extra: number
} {
  const counts = { essential: 0, ideal: 0, extra: 0 }
  for (const s of slots) {
    if (s.tier in counts) counts[s.tier]++
  }
  return counts
}

export function buildTieredWallData(
  logs: Array<{ date: string; practice_id: string; sub_id: string | null }>,
  slots: UserPracticeSlot[],
): Array<{ date: string; value: number }> {
  const slotMap = new Map(slots.map((s) => [s.id, s]))
  const tierCounts = countByTier(slots)

  const tieredLogs: TieredLog[] = logs
    .map((log) => {
      const slotKey = composeSlotKey(log.practice_id, log.sub_id!)
      const slot = slotMap.get(slotKey)
      if (!slot) return undefined
      return {
        date: log.date,
        practice_id: slotKey,
        tier: slot.tier,
      }
    })
    .filter((l): l is TieredLog => l !== undefined)

  return toTieredWallData(tieredLogs, tierCounts)
}
