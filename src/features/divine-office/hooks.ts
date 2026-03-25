import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
	completeOfficeHour,
	getAllReadingProgress,
	getDailyOfficeForDate,
	getReadingProgressByType,
	updateReadingProgress,
} from '@/db/repositories'

import { getNextCccParagraph, getNextReading } from './utils'

type OfficeHour = 'morning' | 'evening' | 'compline'
type ReadingType = 'ot' | 'nt' | 'catechism'

export function useDailyOfficeStatus(date: string) {
	return useQuery({
		queryKey: ['dailyOffice', date],
		queryFn: async () => {
			const rows = await getDailyOfficeForDate(date)

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
		mutationFn: ({ date, hour }: { date: string; hour: OfficeHour }) =>
			completeOfficeHour(date, hour),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['dailyOffice'] })
		},
	})
}

export function useReadingProgress(type: ReadingType) {
	return useQuery({
		queryKey: ['readingProgress', type],
		queryFn: () => getReadingProgressByType(type),
	})
}

export function useAllReadingProgress() {
	return useQuery({
		queryKey: ['readingProgress'],
		queryFn: getAllReadingProgress,
	})
}

export function useAdvanceReading() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ type }: { type: ReadingType }) => {
			const current = await getReadingProgressByType(type)
			if (!current) return

			if (type === 'catechism') {
				const nextParagraph = getNextCccParagraph(current.current_chapter)
				await updateReadingProgress(type, { currentChapter: nextParagraph })
				return
			}

			const next = getNextReading(current.current_book, current.current_chapter, type)

			const completedBooks: string[] = JSON.parse(current.completed_books)
			if (next.bookComplete && !completedBooks.includes(current.current_book)) {
				completedBooks.push(current.current_book)
			}

			await updateReadingProgress(type, {
				currentBook: next.book,
				currentChapter: next.chapter,
				currentVerse: 1,
				completedBooks: JSON.stringify(completedBooks),
			})
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
			const current = await getReadingProgressByType(type)
			if (!current) return

			const completedBooks: string[] = JSON.parse(current.completed_books)
			const merged = Array.from(new Set([...completedBooks, ...bookIds]))

			let currentBook = current.current_book
			let currentChapter = current.current_chapter

			if (bookIds.includes(currentBook)) {
				const next = getNextReading(currentBook, Number.MAX_SAFE_INTEGER, type)
				currentBook = next.book
				currentChapter = 1
			}

			await updateReadingProgress(type, {
				currentBook,
				currentChapter,
				completedBooks: JSON.stringify(merged),
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}
