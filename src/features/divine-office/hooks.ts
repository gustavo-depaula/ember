import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'

import { db } from '@/db/client'
import { dailyOffice, readingProgress } from '@/db/schema'

import { getNextCccParagraph, getNextReading } from './utils'

type OfficeHour = 'morning' | 'evening' | 'compline'
type ReadingType = 'ot' | 'nt' | 'catechism'

export function useDailyOfficeStatus(date: string) {
	return useQuery({
		queryKey: ['dailyOffice', date],
		queryFn: async () => {
			const rows = await db.select().from(dailyOffice).where(eq(dailyOffice.date, date))

			const status: Record<OfficeHour, boolean> = {
				morning: false,
				evening: false,
				compline: false,
			}

			for (const row of rows) {
				if (row.hour in status) {
					status[row.hour as OfficeHour] = row.completed === 1
				}
			}

			return status
		},
	})
}

export function useCompleteOfficeHour() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ date, hour }: { date: string; hour: OfficeHour }) => {
			await db
				.insert(dailyOffice)
				.values({
					date,
					hour,
					completed: 1,
					completedAt: Date.now(),
				})
				.onConflictDoUpdate({
					target: [dailyOffice.date, dailyOffice.hour],
					set: { completed: 1, completedAt: Date.now() },
				})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dailyOffice'] })
		},
	})
}

export function useReadingProgress(type: ReadingType) {
	return useQuery({
		queryKey: ['readingProgress', type],
		queryFn: () =>
			db
				.select()
				.from(readingProgress)
				.where(eq(readingProgress.type, type))
				.then((rows) => rows[0]),
	})
}

export function useAllReadingProgress() {
	return useQuery({
		queryKey: ['readingProgress'],
		queryFn: () => db.select().from(readingProgress),
	})
}

export function useAdvanceReading() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ type }: { type: ReadingType }) => {
			const [current] = await db
				.select()
				.from(readingProgress)
				.where(eq(readingProgress.type, type))

			if (!current) return

			if (type === 'catechism') {
				const nextParagraph = getNextCccParagraph(current.currentChapter)
				await db
					.update(readingProgress)
					.set({ currentChapter: nextParagraph })
					.where(eq(readingProgress.type, type))
				return
			}

			const next = getNextReading(current.currentBook, current.currentChapter, type)

			const completedBooks: string[] = JSON.parse(current.completedBooks)
			if (next.bookComplete && !completedBooks.includes(current.currentBook)) {
				completedBooks.push(current.currentBook)
			}

			await db
				.update(readingProgress)
				.set({
					currentBook: next.book,
					currentChapter: next.chapter,
					currentVerse: 1,
					completedBooks: JSON.stringify(completedBooks),
				})
				.where(eq(readingProgress.type, type))
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}

export function useMarkBooksRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ type, bookIds }: { type: 'ot' | 'nt'; bookIds: string[] }) => {
			const [current] = await db
				.select()
				.from(readingProgress)
				.where(eq(readingProgress.type, type))

			if (!current) return

			const completedBooks: string[] = JSON.parse(current.completedBooks)
			const merged = Array.from(new Set([...completedBooks, ...bookIds]))

			// If the current book was marked as read, advance to the next unread book
			let currentBook = current.currentBook
			let currentChapter = current.currentChapter

			if (bookIds.includes(currentBook)) {
				const next = getNextReading(currentBook, Number.MAX_SAFE_INTEGER, type)
				currentBook = next.book
				currentChapter = 1
			}

			await db
				.update(readingProgress)
				.set({
					currentBook,
					currentChapter,
					completedBooks: JSON.stringify(merged),
				})
				.where(eq(readingProgress.type, type))
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}
