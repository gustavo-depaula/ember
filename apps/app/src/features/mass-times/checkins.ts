import { format } from 'date-fns'
import { useMemo } from 'react'

import { emit, useEventStore } from '@/db/events'
import type { CheckIn, CheckInKind } from '@/db/schema'
import { completePractice } from '@/features/plan-of-life'
import { getToday } from '@/hooks/useToday'
import { randomId } from '@/lib/id'

// A personal log of church check-ins — visits you record while you're there (a quiet devotional
// record, not a leaderboard). A check-in names what you were there for; a Mass check-in
// additionally completes the "mass" practice (see CheckIn), so Mass attendance isn't a separate
// concept from the plan of life.

export type { CheckIn, CheckInKind }

/** Rejects, leaving the log as it was, when the check-in could not be saved. */
export async function checkIn(
  church: { id: string; name: string },
  details: { kind: CheckInKind; note?: string },
  at = new Date(),
): Promise<void> {
  const entry: CheckIn = {
    id: randomId(),
    churchId: church.id,
    churchName: church.name,
    kind: details.kind,
    note: details.note?.trim() || undefined,
    at: at.toISOString(),
  }
  await withRetry(() => emit({ type: 'CheckInLogged', checkIn: entry }))
  // A Mass check-in IS a completion of the "mass" practice — record it so it flows into the plan
  // of life / streaks rather than being a parallel tally. (Domain rule lives here, not the UI.)
  if (details.kind !== 'mass') return
  try {
    await withRetry(() =>
      completePractice('mass', format(getToday(), 'yyyy-MM-dd'), { via: 'checkin' }),
    )
  } catch (err) {
    await emit({ type: 'CheckInRemoved', checkInId: entry.id })
    throw err
  }
}

/** Rejects, leaving the log as it was, when the removal could not be saved. */
export async function removeCheckIn(id: string): Promise<void> {
  await emit({ type: 'CheckInRemoved', checkInId: id })
}

export function useCheckInCount(): number {
  return useEventStore((s) => s.checkIns.size)
}

// Sorted once for each state of the log, however many rows ask.
let sorted: { of: Map<string, CheckIn>; newestFirst: CheckIn[] } | undefined

function newestFirst(checkIns: Map<string, CheckIn>): CheckIn[] {
  if (sorted?.of !== checkIns) {
    // ISO timestamps order as text.
    const list = [...checkIns.values()].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    sorted = { of: checkIns, newestFirst: list }
  }
  return sorted.newestFirst
}

/** Every check-in, newest first. */
export function useRecentCheckIns(): CheckIn[] {
  return useEventStore((s) => newestFirst(s.checkIns))
}

// One local day's check-ins, in the order they happened.
export function useCheckInsOn(date: string): CheckIn[] {
  const recent = useRecentCheckIns()
  return useMemo(
    () => recent.filter((c) => format(new Date(c.at), 'yyyy-MM-dd') === date).reverse(),
    [recent, date],
  )
}

// Per-church: how many times you've checked in, and when last.
export function useChurchAttendance(churchId: string): { count: number; last?: string } {
  const recent = useRecentCheckIns()
  return useMemo(() => {
    const mine = recent.filter((c) => c.churchId === churchId)
    return { count: mine.length, last: mine[0]?.at }
  }, [recent, churchId])
}

// SQLite refuses a write while something else holds the database ("database is
// locked"). That clears within moments, so a write is tried again before it fails.
const retryDelaysMs = [150, 500]

async function withRetry<T>(write: () => Promise<T>): Promise<T> {
  for (const delay of retryDelaysMs) {
    try {
      return await write()
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  return write()
}
