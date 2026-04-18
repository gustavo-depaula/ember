import { useMemo } from 'react'

import { useEventStore } from '@/db/events'
import type { IntentionState } from '@/db/events/state'
import type { Completion } from '@/db/schema'

export type MemoriaEntry =
  | { kind: 'completion'; id: string; timestamp: number; completion: Completion }
  | { kind: 'intention-added'; id: string; timestamp: number; intention: IntentionState }
  | { kind: 'intention-answered'; id: string; timestamp: number; intention: IntentionState }

export function useMemoriaEntries(limit = 200): MemoriaEntry[] {
  const completions = useEventStore((s) => s.completions)
  const intentions = useEventStore((s) => s.intentions)

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
    entries.sort((a, b) => b.timestamp - a.timestamp)
    return entries.slice(0, limit)
  }, [completions, intentions, limit])
}

export function useMemoriaEntriesCount(): number {
  return useEventStore((s) => s.completions.size + s.intentions.size + countAnswered(s.intentions))
}

function countAnswered(intentions: Map<number, IntentionState>): number {
  let n = 0
  for (const i of intentions.values()) if (i.answered_at !== null) n++
  return n
}
