import { differenceInCalendarDays, format, subDays } from 'date-fns'

export type DayCompletion = {
	date: string
	completed: number
	total: number
}

export function getCurrentStreak(logs: DayCompletion[]): number {
	const byDate = new Map(logs.map((l) => [l.date, l]))
	let streak = 0
	let day = new Date()

	while (true) {
		const key = format(day, 'yyyy-MM-dd')
		const entry = byDate.get(key)
		if (!entry || entry.completed === 0) break
		streak++
		day = subDays(day, 1)
	}

	return streak
}

export function getLongestStreak(logs: DayCompletion[]): number {
	if (logs.length === 0) return 0

	const sorted = [...logs]
		.filter((l) => l.completed > 0)
		.sort((a, b) => a.date.localeCompare(b.date))

	if (sorted.length === 0) return 0

	let longest = 1
	let current = 1

	for (let i = 1; i < sorted.length; i++) {
		const prev = new Date(sorted[i - 1].date)
		const curr = new Date(sorted[i].date)
		if (differenceInCalendarDays(curr, prev) === 1) {
			current++
			if (current > longest) longest = current
		} else {
			current = 1
		}
	}

	return longest
}

export function getCompletionRate(logs: DayCompletion[]): number {
	if (logs.length === 0) return 0
	const totalPossible = logs.reduce((sum, l) => sum + l.total, 0)
	if (totalPossible === 0) return 0
	const totalCompleted = logs.reduce((sum, l) => sum + l.completed, 0)
	return totalCompleted / totalPossible
}

export function getPracticeStreak(dates: string[]): number {
	if (dates.length === 0) return 0

	const sorted = new Set(dates)
	let streak = 0
	let day = new Date()

	while (true) {
		const key = format(day, 'yyyy-MM-dd')
		if (!sorted.has(key)) break
		streak++
		day = subDays(day, 1)
	}

	return streak
}

// Maps completion ratio to 0-4 intensity for green wall rendering
export function toGreenWallData(
	logs: Array<{ date: string; completed: number }>,
	totalPractices: number,
): Array<{ date: string; value: number }> {
	if (totalPractices === 0) return logs.map((l) => ({ date: l.date, value: 0 }))

	return logs.map((l) => {
		const ratio = l.completed / totalPractices
		const value = (() => {
			if (ratio === 0) return 0
			if (ratio <= 0.25) return 1
			if (ratio <= 0.5) return 2
			if (ratio <= 0.75) return 3
			return 4
		})()
		return { date: l.date, value }
	})
}
