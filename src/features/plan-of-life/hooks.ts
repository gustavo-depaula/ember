import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProgramConfig } from '@/content/types'
import {
  addSlot,
  changeSlotFlow,
  createPracticeWithSlot,
  deletePractice,
  deleteSlot,
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
  toggleCompletion,
  updatePractice,
  updateSlot,
} from '@/db/repositories'
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

      // For 'continue' policy, derive programDay from the schedule's startDate
      // For 'wait' policy, use the cursor (only advances on completion)
      let programDay = position.day
      if (program.progressPolicy === 'continue') {
        const slots = await getSlotsForPractice(practiceId)
        const slot = slots[0]
        if (slot) {
          const schedule = parseSchedule(slot.schedule)
          const calendarDay = getProgramDay(schedule, getToday())
          if (calendarDay !== undefined) programDay = calendarDay
        }
      }

      return {
        programDay,
        totalDays: program.totalDays,
        isComplete: position.status === 'completed',
        policy: program.progressPolicy,
      }
    },
    enabled: !!program,
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
      subId?: string
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
    }) => toggleCompletion(practiceId, date, completed, slotId === 'default' ? undefined : slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
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
