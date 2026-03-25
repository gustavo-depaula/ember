import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import {
	completeOfficeHour,
	getAllReadingProgress,
	getDailyOfficeForDate,
	getReadingProgressByType,
	updateReadingProgress,
} from '@/db/repositories'
import { getPsalmNumbering } from '@/lib/bolls'
import { getChapter, type Verse } from '@/lib/content'
import { usePreferencesStore } from '@/stores/preferencesStore'

import {
	buildPrayerSections,
	getCccParagraphs,
	type OfficeHour,
	type PrayerSection,
	type ReadingReference,
} from './engine'
import type { PsalmRef } from './psalter'
import { getNextCccParagraph, getNextReading } from './utils'

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
		mutationFn: async ({ type, count = 1 }: { type: ReadingType; count?: number }) => {
			const current = await getReadingProgressByType(type)
			if (!current) return

			if (type === 'catechism') {
				let paragraph = current.current_chapter
				for (let i = 0; i < count; i++) {
					paragraph = getNextCccParagraph(paragraph)
				}
				await updateReadingProgress(type, { currentChapter: paragraph })
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

async function modifyCompletedChapters(
	type: 'ot' | 'nt',
	modifier: (chapters: Record<string, number[]>) => void,
) {
	const current = await getReadingProgressByType(type)
	if (!current) return

	const chapters: Record<string, number[]> = JSON.parse(current.completed_chapters)
	modifier(chapters)

	await updateReadingProgress(type, {
		completedChapters: JSON.stringify(chapters),
	})
}

export function useToggleChapterRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			type,
			bookId,
			chapter,
		}: {
			type: 'ot' | 'nt'
			bookId: string
			chapter: number
		}) =>
			modifyCompletedChapters(type, (chapters) => {
				const bookChapters = chapters[bookId] ?? []
				if (bookChapters.includes(chapter)) {
					chapters[bookId] = bookChapters.filter((c) => c !== chapter)
					if (chapters[bookId].length === 0) delete chapters[bookId]
				} else {
					chapters[bookId] = [...bookChapters, chapter].sort((a, b) => a - b)
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}

export function useToggleBookRead() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			type,
			bookId,
			totalChapters,
		}: {
			type: 'ot' | 'nt'
			bookId: string
			totalChapters: number
		}) =>
			modifyCompletedChapters(type, (chapters) => {
				const bookChapters = chapters[bookId] ?? []
				if (bookChapters.length === totalChapters) {
					delete chapters[bookId]
				} else {
					chapters[bookId] = Array.from({ length: totalChapters }, (_, i) => i + 1)
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}

export function useSetReadingPosition() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ type, book, chapter }: { type: string; book?: string; chapter: number }) =>
			updateReadingProgress(type, {
				currentBook: book,
				currentChapter: chapter,
				currentVerse: 1,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['readingProgress'] })
		},
	})
}

// --- Content-loading hooks ---

export type PsalmData = { ref: PsalmRef; verses: Verse[] }

export function usePsalmsForHour(psalms: PsalmRef[], translation: string) {
	const results = useQueries({
		queries: psalms.map((ref) => ({
			queryKey: ['psalm', translation, ref.psalm, ref.verseRange ?? null],
			queryFn: async (): Promise<PsalmData> => {
				const result = await getChapter(translation, 'psalms', ref.psalm)
				let verses = result.verses
				if (ref.verseRange) {
					verses = verses.filter(
						(v) => v.verse >= ref.verseRange![0] && v.verse <= ref.verseRange![1],
					)
				}
				return { ref, verses }
			},
		})),
	})

	const isLoading = results.some((r) => r.isLoading)
	const data = results.map((r) => r.data).filter((d): d is PsalmData => d !== undefined)

	return { data, isLoading }
}

export function useBibleReading(
	book: string | undefined,
	chapter: number | undefined,
	translation: string,
) {
	return useQuery({
		queryKey: ['chapter', translation, book, chapter],
		queryFn: () => getChapter(translation, book as string, chapter as number),
		enabled: !!book && !!chapter,
	})
}

export function useCccReading(start: number | undefined, count: number | undefined) {
	return useQuery({
		queryKey: ['ccc', start, count],
		queryFn: () => getCccParagraphs(start as number, count as number),
		enabled: !!start && !!count,
	})
}

// --- Composite hook ---

function findReadingRef(sections: PrayerSection[]): ReadingReference | undefined {
	const section = sections.find(
		(s): s is Extract<PrayerSection, { type: 'reading' }> => s.type === 'reading',
	)
	return section?.reference
}

function findPsalmRefs(sections: PrayerSection[]): PsalmRef[] | undefined {
	const section = sections.find(
		(s): s is Extract<PrayerSection, { type: 'psalmody' }> => s.type === 'psalmody',
	)
	return section?.psalms
}

export function usePrayerContent(hour: OfficeHour, date: string) {
	const translation = usePreferencesStore((s) => s.translation)
	const numbering = getPsalmNumbering(translation)

	const { data: otProgress } = useReadingProgress('ot')
	const { data: ntProgress } = useReadingProgress('nt')
	const { data: catechismProgress } = useReadingProgress('catechism')

	const progress = useMemo(
		() => ({ ot: otProgress, nt: ntProgress, catechism: catechismProgress }),
		[otProgress, ntProgress, catechismProgress],
	)

	const sections = useMemo(() => {
		const parsedDate = new Date(date)
		return buildPrayerSections(hour, parsedDate, progress, numbering)
	}, [hour, date, progress, numbering])

	const readingRef = useMemo(() => findReadingRef(sections), [sections])
	const psalmRefs = useMemo(() => findPsalmRefs(sections) ?? [], [sections])

	const bibleRef = readingRef?.type === 'bible' ? readingRef : undefined
	const cccRef = readingRef?.type === 'catechism' ? readingRef : undefined

	const psalmResult = usePsalmsForHour(psalmRefs, translation)
	const bibleResult = useBibleReading(bibleRef?.book, bibleRef?.chapter, translation)
	const cccResult = useCccReading(cccRef?.startParagraph, cccRef?.count)

	const isLoading = psalmResult.isLoading || bibleResult.isLoading || cccResult.isLoading

	return {
		sections,
		psalmData: psalmResult.data,
		readingData: bibleResult.data,
		cccData: cccResult.data,
		isLoading,
	}
}
