import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPractice,
  deletePractice,
  getAllPractices,
  getCompletionDates,
  getCompletionRange,
  getCompletionsForDate,
  getCompletionsForPractice,
  getEnabledPractices,
  logCompletion,
  removeCompletion,
  reorderPractices,
  toggleCompletion,
  updatePractice,
} from '@/db/repositories'
import { rescheduleAllReminders } from '@/lib/notifications'

import { getPracticeStreak } from './utils'

export function usePractices() {
  return useQuery({
    queryKey: ['practices'],
    queryFn: getEnabledPractices,
  })
}

export function useAllPractices() {
  return useQuery({
    queryKey: ['practices', 'all'],
    queryFn: getAllPractices,
  })
}

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

export function useTogglePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      practiceId,
      date,
      completed,
    }: {
      practiceId: string
      date: string
      completed: boolean
    }) => toggleCompletion(practiceId, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
    },
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

export function useCreatePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
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
      queryClient.invalidateQueries({ queryKey: ['practices'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useDeletePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
      queryClient.invalidateQueries({ queryKey: ['completions'] })
      rescheduleAllReminders().catch(console.warn)
    },
  })
}

export function useReorderPractices() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderPractices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}
