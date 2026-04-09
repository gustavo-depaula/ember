import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getManifest } from '@/content/registry'
import type { ProgramConfig } from '@/content/types'
import {
  addSlot,
  advanceProgramDay,
  changeSlotFlow,
  completeProgramCursor,
  createPracticeWithSlot,
  deletePractice,
  deleteSlot,
  disableSlotsForPractice,
  enableSlotsForPractice,
  getAllSlots,
  getCompletionDates,
  getCompletionRange,
  getCompletionsForDate,
  getCompletionsForPractice,
  getEnabledSlots,
  getPractice,
  getProgramCursor,
  getSlotsForPractice,
  logCompletion,
  parseProgramPosition,
  removeCompletion,
  reorderSlots,
  restartProgram,
  toggleCompletion,
  updatePractice,
  updateSlot,
} from '@/db/repositories'
import type { Completion } from '@/db/schema'
import { getToday } from '@/hooks/useToday'
import { rescheduleAllReminders } from '@/lib/notifications'

import { getProgramDay, parseSchedule } from './schedule'
import { getPracticeStreak } from './utils'

// --- Slot queries ---

export function useSlots() {
  return useQuery({
    queryKey: ['slots'],
    queryFn: getEnabledSlots,
  })
}

export function useAllSlots() {
  return useQuery({
    queryKey: ['slots', 'all'],
    queryFn: getAllSlots,
  })
}

export function useSlotsForPractice(practiceId: string | undefined) {
  return useQuery({
    queryKey: ['slots', 'practice', practiceId],
    queryFn: () => getSlotsForPractice(practiceId!),
    enabled: !!practiceId,
  })
}

// --- Practice queries ---

export function usePractice(practiceId: string | undefined) {
  return useQuery({
    queryKey: ['practice', practiceId],
    queryFn: () => getPractice(practiceId!),
    enabled: !!practiceId,
  })
}

// --- Completion queries ---

export function useCompletionsForDate(date: string | undefined) {
  return useQuery({
    queryKey: ['completions', date],
    queryFn: () => getCompletionsForDate(date as string),
    enabled: !!date,
  })
}

export function useCompletionsForPractice(practiceId: string, date: string) {
  return useQuery({
    queryKey: ['completions', practiceId, date],
    queryFn: () => getCompletionsForPractice(practiceId, date),
  })
}

export function useCompletionRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['completions', 'range', startDate, endDate],
    queryFn: () => getCompletionRange(startDate, endDate),
  })
}

export function usePracticeCompletionStats(practiceId: string) {
  return useQuery({
    queryKey: ['practiceStats', practiceId],
    queryFn: async () => {
      const completedDates = await getCompletionDates(practiceId)
      const currentStreak = getPracticeStreak(completedDates)
      const totalDays = completedDates.length
      return { currentStreak, totalDays, completedDates }
    },
  })
}

// --- Program progress ---

export function useProgramProgress(practiceId: string, program: ProgramConfig | undefined) {
  return useQuery({
    queryKey: ['programProgress', practiceId],
    queryFn: async () => {
      if (!program) return undefined

      const cursor = await getProgramCursor(practiceId)
      const position = cursor ? parseProgramPosition(cursor) : { day: 0, status: 'active' as const }

      let programDay = position.day
      let calendarDay: number | undefined
      if (program.progressPolicy === 'continue' || program.progressPolicy === 'restart') {
        const slots = await getSlotsForPractice(practiceId)
        const slot = slots[0]
        if (slot) {
          const schedule = parseSchedule(slot.schedule)
          calendarDay = getProgramDay(schedule, getToday())
          if (calendarDay !== undefined) programDay = calendarDay
        }
      }

      const missedDays = (() => {
        if (program.progressPolicy === 'wait') return 0
        if (calendarDay === undefined) return 0
        const gap = calendarDay - position.day
        return gap > 0 ? gap : 0
      })()

      const threshold = program.restartThreshold ?? 1
      const shouldPromptRestart = program.progressPolicy === 'restart' && missedDays >= threshold

      return {
        programDay,
        totalDays: program.totalDays,
        isComplete: position.status === 'completed',
        policy: program.progressPolicy,
        completionBehavior: program.completionBehavior,
        missedDays,
        shouldPromptRestart,
      }
    },
    enabled: !!program,
  })
}

// --- Program mutations ---

export function useHandleProgramCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      practiceId,
      completionBehavior,
    }: {
      practiceId: string
      completionBehavior: 'auto-disable' | 'offer-restart' | 'keep'
    }) => {
      await completeProgramCursor(practiceId)
      if (completionBehavior === 'auto-disable') {
        await disableSlotsForPractice(practiceId)
      }
    },
    onSuccess: (_data, { practiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['programProgress', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useRestartProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ practiceId }: { practiceId: string }) => {
      await restartProgram(practiceId)
      const slots = await getSlotsForPractice(practiceId)
      const slot = slots[0]
      if (slot) {
        const today = getToday().toISOString().split('T')[0]
        const schedule = parseSchedule(slot.schedule)
        if (schedule.type === 'fixed-program') {
          await updateSlot(slot.id, {
            schedule: JSON.stringify({ ...schedule, startDate: today }),
            enabled: 1,
          })
        }
      }
    },
    onSuccess: (_data, { practiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['programProgress', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

// --- Completion mutations ---

export function useLogCompletion() {
  const queryClient = useQueryClient()

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
    },
  })
}

export function useRemoveCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => removeCompletion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
    },
  })
}

export function useToggleSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      practiceId,
      slotId,
      date,
      completed,
    }: {
      practiceId: string
      slotId: string
      date: string
      completed: boolean
    }) => {
      await toggleCompletion(practiceId, date, completed, slotId)
      if (completed && getManifest(practiceId)?.program) {
        await advanceProgramDay(practiceId)
      }
    },
    onMutate: async ({ practiceId, slotId, date, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['completions', date] })
      const previous = queryClient.getQueryData<Completion[]>(['completions', date])

      queryClient.setQueryData<Completion[]>(['completions', date], (old = []) => {
        if (completed) {
          return [
            ...old,
            {
              id: -Date.now(),
              practice_id: practiceId,
              sub_id: slotId,
              date,
              completed_at: Date.now(),
            },
          ]
        }
        return old.filter((c) => c.practice_id !== practiceId || c.sub_id !== slotId)
      })

      return { previous, date }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['completions', context.date], context.previous)
      }
    },
    onSettled: (_data, _err, { practiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
      queryClient.invalidateQueries({ queryKey: ['programProgress', practiceId] })
    },
  })
}

// --- Practice mutations ---

export function useCreatePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      id: string
      customName?: string
      customIcon?: string
      customDesc?: string
      slot?: Parameters<typeof addSlot>[1]
    }) => createPracticeWithSlot(data, data.slot ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['practice'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useEnableSlotsForPractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enableSlotsForPractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useUpdatePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePractice>[1] }) =>
      updatePractice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['practice'] })
    },
  })
}

export function useDeletePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['practice'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

// --- Slot mutations ---

export function useAddSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      practiceId,
      data,
    }: {
      practiceId: string
      data: Parameters<typeof addSlot>[1]
    }) => addSlot(practiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useUpdateSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSlot>[1] }) =>
      updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useChangeSlotFlow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oldSlotKey, newFlowId }: { oldSlotKey: string; newFlowId: string }) =>
      changeSlotFlow(oldSlotKey, newFlowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useDeleteSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useReorderSlots() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderSlots,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}
