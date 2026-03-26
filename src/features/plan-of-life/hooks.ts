import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getEnabledPractices,
  getPracticeCompletedDates,
  getPracticeLogRange,
  getPracticeLogsForDate,
  togglePractice,
} from '@/db/repositories'

import { getPracticeStreak } from './utils'

export function usePractices() {
  return useQuery({
    queryKey: ['practices'],
    queryFn: getEnabledPractices,
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
