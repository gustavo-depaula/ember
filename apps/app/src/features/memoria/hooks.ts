import { useMemo } from 'react'

import { useEventStore } from '@/db/events'
import type { GratitudeState, IntentionState } from '@/db/events/state'
import type { Completion } from '@/db/schema'

export type MemoriaEntry =
  | { kind: 'completion'; id: string; timestamp: number; completion: Completion }
  | { kind: 'intention-added'; id: string; timestamp: number; intention: IntentionState }
  | { kind: 'intention-answered'; id: string; timestamp: number; intention: IntentionState }
  | { kind: 'gratitude'; id: string; timestamp: number; gratitude: GratitudeState }
  | { kind: 'day-offered'; id: string; timestamp: number; date: string }

export function useMemoriaEntries(limit = 200): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)
  const intentions = useEventStore((s) => s.intentions)
  const gratitudes = useEventStore((s) => s.gratitudes)
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
    for (const i of intentions.values()) {
      entries.push({
        kind: 'intention-added',
        id: `ia:${i.id}`,
        timestamp: i.created_at,
        intention: i,
      })
      if (i.answered_at !== null) {
        entries.push({
          kind: 'intention-answered',
          id: `iw:${i.id}`,
          timestamp: i.answered_at,
          intention: i,
        })
      }
    }
    for (const g of gratitudes.values()) {
      entries.push({
        kind: 'gratitude',
        id: `g:${g.id}`,
        timestamp: g.recorded_at,
        gratitude: g,
      })
    }
    for (const [date, offeredAt] of offeredDays) {
      entries.push({ kind: 'day-offered', id: `d:${date}`, timestamp: offeredAt, date })
    }
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries.slice(0, limit)
  }, [completions, intentions, gratitudes, offeredDays, limit])
}

export function useMemoriaEntriesCount(): number {
  return useEventStore(
    (s) =>
      s.completions.size +
      s.intentions.size +
      countAnswered(s.intentions) +
      s.gratitudes.size +
      s.offeredDays.size,
  )
}

export function useOnThisDayEntries(now: Date): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)
  const gratitudes = useEventStore((s) => s.gratitudes)
  const offeredDays = useEventStore((s) => s.offeredDays)

  return useMemo(() => {
    const month = now.getMonth()
    const day = now.getDate()
    const year = now.getFullYear()
    const entries: MemoriaEntry[] = []

    for (const c of completions.values()) {
      const ts = new Date(c.completed_at)
      if (ts.getMonth() === month && ts.getDate() === day && ts.getFullYear() < year) {
        entries.push({
          kind: 'completion',
          id: `c:${c.id}`,
          timestamp: c.completed_at,
          completion: c,
        })
      }
    }
    for (const g of gratitudes.values()) {
      const ts = new Date(g.recorded_at)
      if (ts.getMonth() === month && ts.getDate() === day && ts.getFullYear() < year) {
        entries.push({
          kind: 'gratitude',
          id: `g:${g.id}`,
          timestamp: g.recorded_at,
          gratitude: g,
        })
      }
    }
    for (const [date, offeredAt] of offeredDays) {
      const ts = new Date(offeredAt)
      if (ts.getMonth() === month && ts.getDate() === day && ts.getFullYear() < year) {
        entries.push({ kind: 'day-offered', id: `d:${date}`, timestamp: offeredAt, date })
      }
    }
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries
  }, [completions, gratitudes, offeredDays, now])
}

function countAnswered(intentions: Map<number, IntentionState>): number {
  let n = 0
  for (const i of intentions.values()) if (i.answered_at !== null) n++
  return n
}
