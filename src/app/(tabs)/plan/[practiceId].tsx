import { differenceInCalendarDays } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { Card, GreenWall, ScreenLayout } from '@/components'
import {
	getLongestPracticeStreak,
	getPracticeIcon,
	usePracticeStats,
	usePractices,
} from '@/features/plan-of-life'

export default function PracticeDetailScreen() {
	const { practiceId } = useLocalSearchParams<{ practiceId: string }>()
	const router = useRouter()
	const theme = useTheme()

	const { data: practices = [] } = usePractices()
	const practice = practices.find((p) => p.id === practiceId)

	const { data: practiceStats } = usePracticeStats(practiceId ?? '')

	const wallData = useMemo(() => {
		if (!practiceStats?.completedDates) return []
		return practiceStats.completedDates.map((date) => ({ date, value: 4 }))
	}, [practiceStats?.completedDates])

	const stats = useMemo(() => {
		if (!practiceStats) return { streak: 0, longest: 0, total: 0, rate: 0 }

		const { completedDates, currentStreak, totalDays } = practiceStats
		const longest = getLongestPracticeStreak(completedDates)

		const rate = (() => {
			if (completedDates.length === 0) return 0
			const sorted = [...completedDates].sort()
			const firstDay = new Date(sorted[0])
			const daysSinceStart = differenceInCalendarDays(new Date(), firstDay) + 1
			return totalDays / daysSinceStart
		})()

		return { streak: currentStreak, longest, total: totalDays, rate }
	}, [practiceStats])

	if (!practice) {
		return (
			<ScreenLayout>
				<YStack flex={1} alignItems="center" justifyContent="center">
					<Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
						Practice not found
					</Text>
				</YStack>
			</ScreenLayout>
		)
	}

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$lg">
				<XStack alignItems="center" gap="$md">
					<Pressable onPress={() => router.back()} hitSlop={8}>
						<ChevronLeft size={24} color={theme.color.val} />
					</Pressable>
					<Text fontSize={24}>{getPracticeIcon(practice.icon)}</Text>
					<Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
						{practice.name}
					</Text>
				</XStack>

				<YStack alignItems="center">
					<GreenWall data={wallData} />
				</YStack>

				<XStack gap="$md" flexWrap="wrap">
					<Card flex={1} minWidth="40%" alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{stats.streak}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Current Streak
						</Text>
					</Card>
					<Card flex={1} minWidth="40%" alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{stats.longest}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Longest Streak
						</Text>
					</Card>
					<Card flex={1} minWidth="40%" alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{stats.total}
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Total Days
						</Text>
					</Card>
					<Card flex={1} minWidth="40%" alignItems="center" gap="$xs">
						<Text fontFamily="$heading" fontSize="$5" color="$accent">
							{Math.round(stats.rate * 100)}%
						</Text>
						<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
							Completion Rate
						</Text>
					</Card>
				</XStack>
			</YStack>
		</ScreenLayout>
	)
}
