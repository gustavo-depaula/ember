import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { Card, GreenWall, ScreenLayout } from '@/components'
import {
	type DayCompletion,
	getCompletionRate,
	getCurrentStreak,
	getPracticeIcon,
	toGreenWallData,
	usePracticeLogRange,
	usePracticeLogsForDate,
	usePractices,
	useTogglePractice,
} from '@/features/plan-of-life'

const defaultPracticeCount = 8

function aggregateByDate(
	logs: Array<{ date: string; practiceId: string }>,
): Array<{ date: string; completed: number }> {
	const counts = new Map<string, number>()
	for (const log of logs) {
		counts.set(log.date, (counts.get(log.date) ?? 0) + 1)
	}
	return Array.from(counts, ([date, completed]) => ({ date, completed }))
}

function toCompletedSet(logs: Array<{ completed: number; practiceId: string }>) {
	return new Set(logs.filter((l) => l.completed).map((l) => l.practiceId))
}

export default function PlanScreen() {
	const router = useRouter()
	const theme = useTheme()
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

				<YStack gap="$sm">
					{practices.map((practice) => {
						const done = completedToday.has(practice.id)
						return (
							<Pressable key={practice.id} onPress={() => router.push(`/plan/${practice.id}`)}>
								<XStack
									backgroundColor="$backgroundSurface"
									borderRadius="$lg"
									padding="$md"
									alignItems="center"
									gap="$md"
								>
									<Text fontSize={20}>{getPracticeIcon(practice.icon)}</Text>
									<Text flex={1} fontFamily="$body" fontSize="$3" color="$color">
										{practice.name}
									</Text>
									<Pressable
										onPress={(e) => {
											e.stopPropagation()
											toggle.mutate({
												practiceId: practice.id,
												date: today,
												completed: !done,
											})
										}}
										hitSlop={8}
									>
										<YStack
											width={28}
											height={28}
											borderRadius={14}
											borderWidth={2}
											borderColor={done ? '$accent' : '$borderColor'}
											backgroundColor={done ? '$accent' : 'transparent'}
											alignItems="center"
											justifyContent="center"
										>
											{done && <Check size={16} color={theme.background.val} />}
										</YStack>
									</Pressable>
								</XStack>
							</Pressable>
						)
					})}
				</YStack>
			</YStack>
		</ScreenLayout>
	)
}
