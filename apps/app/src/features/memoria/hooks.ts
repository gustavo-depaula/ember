import { useMemo } from 'react'

import { useEventStore } from '@/db/events'
import type { Movement } from '@/db/events/state'
import type { Completion } from '@/db/schema'

export type MemoriaEntry =
  | { kind: 'completion'; id: string; timestamp: number; completion: Completion }
  | { kind: 'intention-raised'; id: string; timestamp: number; movement: Movement }
  | { kind: 'intention-closed'; id: string; timestamp: number; movement: Movement }
  | { kind: 'thanksgiving'; id: string; timestamp: number; movement: Movement }
  | { kind: 'day-offered'; id: string; timestamp: number; date: string }

export function useMemoriaEntries(limit = 200): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)
  const movements = useEventStore((s) => s.movements)
  const offeredDays = useEventStore((s) => s.offeredDays)

  return useMemo(() => {
    const entries: MemoriaEntry[] = []
    for (const c of completions.values()) {
      entries.push({
        kind: 'completion',
        id: `c:${c.id}`,
        timestamp: c.completed_at,
        completion: c,
      })
    }
    for (const m of movements.values()) {
      if (m.kind === 'intention') {
        entries.push({
          kind: 'intention-raised',
          id: `ir:${m.id}`,
          timestamp: m.recorded_at,
          movement: m,
        })
        if (m.state === 'closed' && m.closed_at !== undefined) {
          entries.push({
            kind: 'intention-closed',
            id: `ic:${m.id}`,
            timestamp: m.closed_at,
            movement: m,
          })
        }
      } else {
        entries.push({
          kind: 'thanksgiving',
          id: `g:${m.id}`,
          timestamp: m.recorded_at,
          movement: m,
        })
      }
    }
    for (const [date, offeredAt] of offeredDays) {
      entries.push({ kind: 'day-offered', id: `d:${date}`, timestamp: offeredAt, date })
    }
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries.slice(0, limit)
  }, [completions, movements, offeredDays, limit])
}

export function useMemoriaEntriesCount(): number {
  return useEventStore(
    (s) => s.completions.size + countMovementEntries(s.movements) + s.offeredDays.size,
  )
}

export function useOnThisDayEntries(now: Date): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)
  const movements = useEventStore((s) => s.movements)
  const offeredDays = useEventStore((s) => s.offeredDays)

  return useMemo(() => {
    const month = now.getMonth()
    const day = now.getDate()
    const year = now.getFullYear()
    const onPriorAnniversary = (ts: number) => isPriorAnniversary(ts, month, day, year)
    const entries: MemoriaEntry[] = []

    for (const c of completions.values()) {
      if (onPriorAnniversary(c.completed_at)) {
        entries.push({
          kind: 'completion',
          id: `c:${c.id}`,
          timestamp: c.completed_at,
          completion: c,
        })
      }
    }
    for (const m of movements.values()) {
      if (m.kind === 'thanksgiving' && onPriorAnniversary(m.recorded_at)) {
        entries.push({
          kind: 'thanksgiving',
          id: `g:${m.id}`,
          timestamp: m.recorded_at,
          movement: m,
        })
      }
    }
    for (const [date, offeredAt] of offeredDays) {
      if (onPriorAnniversary(offeredAt)) {
        entries.push({ kind: 'day-offered', id: `d:${date}`, timestamp: offeredAt, date })
      }
    }
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries
  }, [completions, movements, offeredDays, now])
}

function isPriorAnniversary(timestamp: number, month: number, day: number, year: number): boolean {
  const d = new Date(timestamp)
  return d.getMonth() === month && d.getDate() === day && d.getFullYear() < year
}

function countMovementEntries(movements: Map<string, Movement>): number {
  let n = 0
  for (const m of movements.values()) {
    n += 1
    if (m.kind === 'intention' && m.state === 'closed') n += 1
  }
  return n
}
