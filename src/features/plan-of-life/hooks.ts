import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { and, between, eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { practiceLogs, practices } from '@/db/schema'

import { getPracticeStreak } from './utils'

export function usePractices() {
	return useQuery({
		queryKey: ['practices'],
		queryFn: () =>
			db.select().from(practices).where(eq(practices.enabled, 1)).orderBy(practices.sortOrder),
	})
}

export function usePracticeLogsForDate(date: string) {
	return useQuery({
		queryKey: ['practiceLogs', date],
		queryFn: () => db.select().from(practiceLogs).where(eq(practiceLogs.date, date)),
	})
}

export function usePracticeLogRange(startDate: string, endDate: string) {
	return useQuery({
		queryKey: ['practiceLogs', 'range', startDate, endDate],
		queryFn: () =>
			db
				.select()
				.from(practiceLogs)
				.where(and(between(practiceLogs.date, startDate, endDate), eq(practiceLogs.completed, 1))),
	})
}

export function useTogglePractice() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			practiceId,
			date,
			completed,
		}: {
			practiceId: string
			date: string
			completed: boolean
		}) => {
			await db
				.insert(practiceLogs)
				.values({
					date,
					practiceId,
					completed: completed ? 1 : 0,
					completedAt: completed ? Date.now() : undefined,
				})
				.onConflictDoUpdate({
					target: [practiceLogs.date, practiceLogs.practiceId],
					set: {
						completed: completed ? 1 : 0,
						completedAt: completed ? Date.now() : undefined,
					},
				})
		},
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
			const logs = await db
				.select()
				.from(practiceLogs)
				.where(and(eq(practiceLogs.practiceId, practiceId), eq(practiceLogs.completed, 1)))

			const completedDates = logs.map((l) => l.date)
			const currentStreak = getPracticeStreak(completedDates)
			const totalDays = completedDates.length

			return { currentStreak, totalDays, completedDates }
		},
	})
}
