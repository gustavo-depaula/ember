import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { confirm } from '@/components'
import { getManifest } from '@/content/resolver'
import type { ProgramConfig } from '@/content/types'
import type { SlotState } from '@/db/events'
import { resolveCompletions, useEventStore } from '@/db/events'
import {
  addSlot,
  archivePractice,
  backfillMissedDays,
  createPracticeWithSlot,
  deletePractice,
  deleteSlot,
  enableSlotsForPractice,
  getSlotsForPractice,
  logCompletion,
  removeCompletion,
  reorderSlots,
  restartProgram,
  toggleCompletion,
  unarchivePractice,
  updatePractice,
  updateSlot,
} from '@/db/repositories'
import type { Completion, UserPractice } from '@/db/schema'
import { getToday, useStableToday, useToday } from '@/hooks/useToday'
import i18n from '@/lib/i18n'
import { rescheduleAllReminders } from '@/lib/notifications'
import { composeSlotKey } from '@/lib/slotKey'

import { projectProgramAtDate } from './program'
import { parseSchedule } from './schedule'
import { getPracticeStreak } from './utils'

// --- Helpers ---

function sortedSlots(slots: Iterable<SlotState>): SlotState[] {
  return [...slots].sort((a, b) => a.sort_order - b.sort_order)
}

function resyncReminders() {
  setTimeout(() => {
    rescheduleAllReminders().catch((error) => {
      console.error('[reminders] reschedule failed', error)
      confirm({
        title: i18n.t('reminders.scheduleFailed'),
        description: i18n.t('reminders.scheduleFailedDesc'),
        singleAction: true,
      })
    })
  }, 0)
}

// --- Slot reads ---

export function useSlots(): SlotState[] {
  return useEventStore(
    useShallow((s) =>
      sortedSlots(
        [...s.slots.values()].filter(
          (slot) => slot.enabled && !s.practices.get(slot.practice_id)?.archived,
        ),
      ),
    ),
  )
}

export function useAllSlots(): SlotState[] {
  return useEventStore(useShallow((s) => sortedSlots(s.slots.values())))
}

export function useSlotsForPractice(practiceId: string | undefined): SlotState[] {
  return useEventStore(
    useShallow((s) => {
      if (!practiceId) return []
      return sortedSlots([...s.slots.values()].filter((slot) => slot.practice_id === practiceId))
    }),
  )
}

// --- Practice reads ---

export function usePractice(practiceId: string | undefined): UserPractice | undefined {
  return useEventStore((s) => (practiceId ? s.practices.get(practiceId) : undefined))
}

// --- Completion reads ---

export function useCompletionsForDate(date: string | undefined): Completion[] {
  return useEventStore(
    useShallow((s) => {
      if (!date) return []
      return resolveCompletions(s.completionsByDate.get(date), s.completions)
    }),
  )
}

export function useCompletionsForPractice(practiceId: string, date: string): Completion[] {
  return useEventStore(
    useShallow((s) =>
      resolveCompletions(s.completionsByDate.get(date), s.completions).filter(
        (c) => c.practice_id === practiceId,
      ),
    ),
  )
}

export function useCompletionRange(startDate: string, endDate: string): Completion[] {
  return useEventStore(
    useShallow((s) => {
      const result: Completion[] = []
      for (const [date, ids] of s.completionsByDate) {
        if (date >= startDate && date <= endDate) {
          for (const c of resolveCompletions(ids, s.completions)) result.push(c)
        }
      }
      return result
    }),
  )
}

export function useCompletionDatesBySlot(): Map<string, string[]> {
  const completions = useEventStore((s) => s.completions)

  return useMemo(() => {
    const result = new Map<string, string[]>()
    for (const c of completions.values()) {
      const key = composeSlotKey(c.practice_id, c.sub_id ?? 'default')
      const existing = result.get(key)
      if (existing) existing.push(c.date)
      else result.set(key, [c.date])
    }
    return result
  }, [completions])
}

// --- Compound reads ---

export function usePracticeCompletionStats(practiceId: string) {
  const { completionsByPractice, completions } = useEventStore(
    useShallow((s) => ({
      completionsByPractice: s.completionsByPractice,
      completions: s.completions,
    })),
  )

  return useMemo(() => {
    const ids = completionsByPractice.get(practiceId)
    const resolved = resolveCompletions(ids, completions)
    const completedDates = [...new Set(resolved.map((c) => c.date))]
    const currentStreak = getPracticeStreak(completedDates)
    const totalDays = completedDates.length
    return { currentStreak, totalDays, completedDates }
  }, [completionsByPractice, completions, practiceId])
}

function sortedCompletionDates(
  ids: Set<number> | undefined,
  completions: Map<number, Completion>,
): string[] {
  const dates = new Set<string>()
  for (const c of resolveCompletions(ids, completions)) dates.add(c.date)
  return [...dates].sort()
}

export function useRestartNeededPractices(): Set<string> {
  const realToday = useStableToday()
  const realKey = realToday.getTime()
  const { slots, practices, cursors, completionsByPractice, completions } = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      practices: s.practices,
      cursors: s.cursors,
      completionsByPractice: s.completionsByPractice,
      completions: s.completions,
    })),
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: realKey gates recomputation; realToday is captured by closure
  return useMemo(() => {
    const result = new Set<string>()

    for (const slot of slots.values()) {
      if (!slot.enabled) continue
      const practice = practices.get(slot.practice_id)
      if (practice?.archived) continue

      const manifest = getManifest(slot.practice_id)
      const program = manifest?.program
      if (!program || program.progressPolicy !== 'restart') continue

      const cursor = cursors.get(`program/${slot.practice_id}`)
      if (!cursor) continue

      const projection = projectProgramAtDate({
        program,
        schedule: parseSchedule(slot.schedule),
        cursor,
        completionDatesAsc: sortedCompletionDates(
          completionsByPractice.get(slot.practice_id),
          completions,
        ),
        realToday,
        targetDate: realToday,
      })
      if (projection.shouldPromptRestart) result.add(slot.practice_id)
    }

    return result
  }, [slots, practices, cursors, completionsByPractice, completions, realKey])
}

export function useProgramProgress(
  practiceId: string,
  program: ProgramConfig | undefined,
  targetDate?: Date,
) {
  const fallbackTarget = useToday()
  const realToday = useStableToday()
  const target = targetDate ?? fallbackTarget
  const { slots, cursors, completionsByPractice, completions } = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      cursors: s.cursors,
      completionsByPractice: s.completionsByPractice,
      completions: s.completions,
    })),
  )

  // Date refs change every render; the primitive *Key derived from getTime()
  // is the stable cache key. `realToday` / `target` are read from the closure.
  const targetKey = target.getTime()
  const realKey = realToday.getTime()

  // biome-ignore lint/correctness/useExhaustiveDependencies: targetKey/realKey gate recomputation; the Date refs are captured by closure
  return useMemo(() => {
    if (!program) return undefined

    const cursor = cursors.get(`program/${practiceId}`) ?? null
    const slot = [...slots.values()].find((s) => s.practice_id === practiceId)
    if (!slot) return undefined

    return projectProgramAtDate({
      program,
      schedule: parseSchedule(slot.schedule),
      cursor,
      completionDatesAsc: sortedCompletionDates(completionsByPractice.get(practiceId), completions),
      realToday,
      targetDate: target,
    })
  }, [slots, cursors, completionsByPractice, completions, practiceId, program, targetKey, realKey])
}

export function useProgramHidesForDate(dateStr: string): ReadonlySet<string> {
  const realToday = useStableToday()
  const { slots, practices, cursors, completionsByPractice, completions } = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      practices: s.practices,
      cursors: s.cursors,
      completionsByPractice: s.completionsByPractice,
      completions: s.completions,
    })),
  )

  const realKey = realToday.getTime()

  // biome-ignore lint/correctness/useExhaustiveDependencies: realKey gates recomputation; realToday is captured by closure
  return useMemo(() => {
    const result = new Set<string>()
    const targetDate = new Date(`${dateStr}T00:00:00`)

    for (const slot of slots.values()) {
      if (!slot.enabled) continue
      const practice = practices.get(slot.practice_id)
      if (practice?.archived) continue

      const manifest = getManifest(slot.practice_id)
      const program = manifest?.program
      if (!program) continue

      const cursor = cursors.get(`program/${slot.practice_id}`) ?? null
      const projection = projectProgramAtDate({
        program,
        schedule: parseSchedule(slot.schedule),
        cursor,
        completionDatesAsc: sortedCompletionDates(
          completionsByPractice.get(slot.practice_id),
          completions,
        ),
        realToday,
        targetDate,
      })
      if (!projection.visible) result.add(slot.id)
    }

    return result
  }, [slots, practices, cursors, completionsByPractice, completions, dateStr, realKey])
}

// --- Archive reads ---

export function useArchivedPractices(): UserPractice[] {
  return useEventStore(
    useShallow((s) => {
      const result: UserPractice[] = []
      for (const p of s.practices.values()) {
        if (p.archived) result.push(p)
      }
      return result
    }),
  )
}

// --- Program mutations ---

export function useHandleProgramCompletion() {
  return useMutation({
    mutationFn: async ({
      practiceId,
      completionBehavior,
    }: {
      practiceId: string
      completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
    }) => {
      if (completionBehavior === 'auto-disable') {
        await archivePractice(practiceId)
      }
    },
  })
}

export function useRestartProgram() {
  return useMutation({
    mutationFn: async ({ practiceId }: { practiceId: string }) => {
      const today = getToday().toISOString().split('T')[0]
      await restartProgram(practiceId, today)
      const slot = getSlotsForPractice(practiceId)[0]
      if (slot) {
        const schedule = parseSchedule(slot.schedule)
        if (schedule.type === 'fixed-program') {
          await updateSlot(slot.id, {
            schedule: JSON.stringify({ ...schedule, startDate: today }),
            enabled: 1,
          })
        } else {
          await updateSlot(slot.id, { enabled: 1 })
        }
      }
    },
  })
}

export function useBackfillMissedDays() {
  return useMutation({
    mutationFn: ({ practiceId, dates }: { practiceId: string; dates: string[] }) =>
      backfillMissedDays(practiceId, dates),
  })
}

// --- Completion mutations ---

export function useLogCompletion() {
  return useMutation({
    mutationFn: ({
      practiceId,
      date,
      subId,
    }: {
      practiceId: string
      date: string
      subId: string
    }) => logCompletion(practiceId, date, subId),
  })
}

export function useRemoveCompletion() {
  return useMutation({
    mutationFn: (id: number) => removeCompletion(id),
  })
}

export function useToggleSlot() {
  return useMutation({
    mutationFn: ({
      practiceId,
      slotId,
      date,
      completed,
    }: {
      practiceId: string
      slotId: string
      date: string
      completed: boolean
    }) => toggleCompletion(practiceId, date, completed, slotId),
  })
}

// --- Practice mutations ---

// Auto-pin practices added or re-enabled in the plan-of-life so the user's
// daily prayers are always available offline. Best-effort: never blocks the
// mutation, never raises if the practice id isn't a corpus item (custom user
// practices have no manifest).
function autoPinForPlan(practiceId: string): void {
  void (async () => {
    try {
      const { getEntry } = await import('@/content/contentIndex')
      const corpusId = `practice/${practiceId}`
      if (!getEntry(corpusId)) return
      const { pinItem, isPinned } = await import('@/features/pinning/pinningManager')
      if (!isPinned(corpusId)) await pinItem(corpusId)
    } catch (err) {
      console.warn('[plan-of-life] auto-pin failed:', err)
    }
  })()
}

export function useCreatePractice() {
  return useMutation({
    mutationFn: (data: {
      id: string
      customName?: string
      customIcon?: string
      customDesc?: string
      activeVariant?: string
      slot?: Parameters<typeof addSlot>[1]
    }) => createPracticeWithSlot(data, data.slot ?? {}),
    onSuccess: (_data, variables) => {
      resyncReminders()
      autoPinForPlan(variables.id)
    },
  })
}

export function useEnableSlotsForPractice() {
  return useMutation({
    mutationFn: enableSlotsForPractice,
    onSuccess: (_data, practiceId) => {
      resyncReminders()
      autoPinForPlan(practiceId)
    },
  })
}

export function useUpdatePractice() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePractice>[1] }) =>
      updatePractice(id, data),
  })
}

export function useDeletePractice() {
  return useMutation({
    mutationFn: deletePractice,
    onSuccess: resyncReminders,
  })
}

// --- Archive mutations ---

export function useArchivePractice() {
  return useMutation({
    mutationFn: archivePractice,
    onSuccess: resyncReminders,
  })
}

export function useUnarchivePractice() {
  return useMutation({
    mutationFn: unarchivePractice,
    onSuccess: resyncReminders,
  })
}

// --- Slot mutations ---

export function useAddSlot() {
  return useMutation({
    mutationFn: ({
      practiceId,
      data,
    }: {
      practiceId: string
      data: Parameters<typeof addSlot>[1]
    }) => addSlot(practiceId, data),
    onSuccess: resyncReminders,
  })
}

export function useUpdateSlot() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSlot>[1] }) =>
      updateSlot(id, data),
    onSuccess: resyncReminders,
  })
}

export function useDeleteSlot() {
  return useMutation({
    mutationFn: deleteSlot,
    onSuccess: resyncReminders,
  })
}

export function useReorderSlots() {
  return useMutation({
    mutationFn: reorderSlots,
  })
}
