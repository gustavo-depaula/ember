import { useMemo } from 'react'

import { useEventStore } from '@/db/events'
import type { Completion } from '@/db/schema'

export type MemoriaEntry = {
  kind: 'completion'
  id: string
  timestamp: number
  completion: Completion
}

function toEntry(c: Completion): MemoriaEntry {
  return { kind: 'completion', id: `c:${c.id}`, timestamp: c.completed_at, completion: c }
}

export function useMemoriaEntries(limit = 200): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)

  return useMemo(() => {
    const entries = Array.from(completions.values(), toEntry)
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries.slice(0, limit)
  }, [completions, limit])
}

export function useMemoriaEntriesCount(): number {
  return useEventStore((s) => s.completions.size)
}

export function useOnThisDayEntries(now: Date): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)

  return useMemo(() => {
    const month = now.getMonth()
    const day = now.getDate()
    const year = now.getFullYear()
    const entries = Array.from(completions.values())
      .filter((c) => isPriorAnniversary(c.completed_at, month, day, year))
      .map(toEntry)
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries
  }, [completions, now])
}

function isPriorAnniversary(timestamp: number, month: number, day: number, year: number): boolean {
  const d = new Date(timestamp)
  return d.getMonth() === month && d.getDate() === day && d.getFullYear() < year
}
