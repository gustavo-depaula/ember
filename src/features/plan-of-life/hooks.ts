import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createPractice,
  deletePractice,
  getAllPractices,
  getEnabledPractices,
  getPracticeCompletedDates,
  getPracticeLogRange,
  getPracticeLogsForDate,
  reorderPractices,
  togglePractice,
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

export function usePracticeLogsForDate(date: string | undefined) {
  return useQuery({
    queryKey: ['practiceLogs', date],
    queryFn: () => getPracticeLogsForDate(date as string),
    enabled: !!date,
  })
}

export function usePracticeLogRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['practiceLogs', 'range', startDate, endDate],
    queryFn: () => getPracticeLogRange(startDate, endDate),
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
    }) => togglePractice(practiceId, date, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceLogs'] })
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] })
    },
  })
}

export function usePracticeStats(practiceId: string) {
  return useQuery({
    queryKey: ['practiceStats', practiceId],
    queryFn: async () => {
      const completedDates = await getPracticeCompletedDates(practiceId)
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
      rescheduleAllReminders()
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
      rescheduleAllReminders()
    },
  })
}

export function useDeletePractice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePractice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
      queryClient.invalidateQueries({ queryKey: ['practiceLogs'] })
      rescheduleAllReminders()
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
