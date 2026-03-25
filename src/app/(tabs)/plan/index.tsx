import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'

import { Card, GreenWall, ScreenLayout } from '@/components'
import {
	type DayCompletion,
	getCompletionRate,
	getCurrentStreak,
	getPracticeIcon,
	PracticeChecklist,
	toCompletedSet,
	toGreenWallData,
	usePracticeLogRange,
	usePracticeLogsForDate,
	usePractices,
	useTogglePractice,
} from '@/features/plan-of-life'

const defaultPracticeCount = 8

function aggregateByDate(
	logs: Array<{ date: string; practice_id: string }>,
): Array<{ date: string; completed: number }> {
	const counts = new Map<string, number>()
	for (const log of logs) {
		counts.set(log.date, (counts.get(log.date) ?? 0) + 1)
	}
	return Array.from(counts, ([date, completed]) => ({ date, completed }))
}

export default function PlanScreen() {
	const router = useRouter()
	const [selectedDay, setSelectedDay] = useState<string>()

	const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
	const rangeStart = useMemo(() => format(subWeeks(new Date(), 20), 'yyyy-MM-dd'), [])

	const { data: practices = [] } = usePractices()
	const { data: rangeLogs = [] } = usePracticeLogRange(rangeStart, today)
	const { data: todayLogs = [] } = usePracticeLogsForDate(today)
	const toggle = useTogglePractice()

	const completedToday = useMemo(() => toCompletedSet(todayLogs), [todayLogs])

	const { wallData, stats } = useMemo(() => {
		const aggregated = aggregateByDate(rangeLogs)
		const total = practices.length || defaultPracticeCount
		const dailyCompletions: DayCompletion[] = aggregated.map((d) => ({
			date: d.date,
			completed: d.completed,
			total,
		}))
		return {
			wallData: toGreenWallData(aggregated, total),
			stats: {
				streak: getCurrentStreak(dailyCompletions),
				rate: getCompletionRate(dailyCompletions),
			},
		}
	}, [rangeLogs, practices.length])

	const { data: selectedDayLogs = [] } = usePracticeLogsForDate(selectedDay)

	const selectedDayCompleted = useMemo(() => toCompletedSet(selectedDayLogs), [selectedDayLogs])

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$lg">
				<Text fontFamily="$heading" fontSize="$5" color="$color">
					Plan of Life
				</Text>

				<GreenWall
					data={wallData}
					onDayPress={(date) => setSelectedDay((prev) => (prev === date ? undefined : date))}
				/>

				{stats.streak === 0 && stats.rate === 0 && (
					<Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
						Complete your daily practices to fill the wall
					</Text>
				)}

				{selectedDay && (
					<Card gap="$sm">
						<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
							{selectedDay}
						</Text>
						{practices.map((p) => (
							<XStack key={p.id} gap="$sm" alignItems="center">
								<Text fontSize={16}>{getPracticeIcon(p.icon)}</Text>
								<Text
									flex={1}
									fontFamily="$body"
									fontSize="$2"
									color={selectedDayCompleted.has(p.id) ? '$color' : '$colorSecondary'}
								>
									{p.name}
								</Text>
								<Text
									fontSize={12}
									color={selectedDayCompleted.has(p.id) ? '$accent' : '$colorSecondary'}
								>
									{selectedDayCompleted.has(p.id) ? '✓' : '–'}
								</Text>
							</XStack>
						))}
					</Card>
				)}

				<XStack gap="$md">
					<Card flex={1} alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{stats.streak}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Day Streak
						</Text>
					</Card>
					<Card flex={1} alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{Math.round(stats.rate * 100)}%
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Completion
						</Text>
					</Card>
				</XStack>

				<Text fontFamily="$heading" fontSize="$4" color="$color">
					Today
				</Text>

				<PracticeChecklist
					practices={practices}
					completedIds={completedToday}
					onToggle={(id, completed) => toggle.mutate({ practiceId: id, date: today, completed })}
					onRowPress={(id) => router.push(`/plan/${id}`)}
				/>
			</YStack>
		</ScreenLayout>
	)
}
