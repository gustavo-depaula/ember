import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { getAllManifests, getManifest, isAlternateForm } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useEventStore } from '@/db/events'
import { sortedCompletionDates, useSlots } from '@/features/plan-of-life/hooks'
import { parseSchedule } from '@/features/plan-of-life/schedule'
import { useToday } from '@/hooks/useToday'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

import { type JoinedProgram, type ProgramEvent, programEvents } from './programEvents'

/** The programs on Today's events row — see `programEvents`. */
export function useProgramEvents(): ProgramEvent[] {
  const today = useToday()
  const todayKey = today.getTime()
  const transfers = useOfTransfers()
  const catalogVersion = useCatalogVersion()
  const slots = useSlots()
  const { cursors, completionsByPractice, completions } = useEventStore(
    useShallow((s) => ({
      cursors: s.cursors,
      completionsByPractice: s.completionsByPractice,
      completions: s.completions,
    })),
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: todayKey keys the day and catalogVersion the manifests; the Date is read from the closure
  return useMemo(() => {
    const joined = new Map<string, JoinedProgram>()
    for (const slot of slots) {
      const manifest = getManifest(slot.practice_id)
      if (!manifest?.program || joined.has(manifest.id)) continue
      joined.set(manifest.id, {
        manifest,
        schedule: parseSchedule(slot.schedule),
        cursor: cursors.get(`program/${slot.practice_id}`) ?? null,
        completionDatesAsc: sortedCompletionDates(
          completionsByPractice.get(slot.practice_id),
          completions,
        ),
      })
    }
    return programEvents({
      joined: [...joined.values()],
      manifests: getAllManifests().filter((m) => m.program && !isAlternateForm(m)),
      today,
      transfers,
    })
  }, [slots, cursors, completionsByPractice, completions, todayKey, transfers, catalogVersion])
}
