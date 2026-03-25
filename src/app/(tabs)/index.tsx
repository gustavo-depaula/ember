import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check } from 'lucide-react-native'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { Card, ProgressBar, ScreenLayout } from '@/components'
import { useAllReadingProgress, useDailyOfficeStatus } from '@/features/divine-office'
import type { OfficeHour } from '@/features/divine-office/engine'
import { getProgressPercentage } from '@/features/divine-office/utils'
import {
	PracticeChecklist,
	toCompletedSet,
	usePracticeLogsForDate,
	usePractices,
	useTogglePractice,
} from '@/features/plan-of-life'

const hourOrder: OfficeHour[] = ['morning', 'evening', 'compline']

const hourMeta: Record<OfficeHour, { label: string; sublabel: string; route: string }> = {
	morning: { label: 'Morning Prayer', sublabel: 'Lauds', route: '/office/morning' },
	evening: { label: 'Evening Prayer', sublabel: 'Vespers', route: '/office/evening' },
	compline: { label: 'Night Prayer', sublabel: 'Compline', route: '/office/compline' },
}

const readingLabels: Record<string, string> = {
	ot: 'Old Testament',
	nt: 'New Testament',
	catechism: 'Catechism',
}

function getGreeting(hour: number): string {
	if (hour >= 5 && hour < 12) return 'Good morning'
	if (hour >= 12 && hour < 17) return 'Good afternoon'
	return 'Good evening'
}

function getNextOfficeHour(
	now: Date,
	status: Record<OfficeHour, boolean> | undefined,
): (typeof hourMeta)[OfficeHour] | undefined {
	if (!status) return hourMeta.morning

	const hour = now.getHours()
	const startIndex = hour < 12 ? 0 : hour < 21 ? 1 : 2

	for (let i = startIndex; i < hourOrder.length; i++) {
		if (!status[hourOrder[i]]) return hourMeta[hourOrder[i]]
	}
	return undefined
}

export default function HomeScreen() {
	const router = useRouter()
	const theme = useTheme()
	const now = new Date()
	const today = format(now, 'yyyy-MM-dd')
	const greeting = getGreeting(now.getHours())

	const { data: practices = [] } = usePractices()
	const { data: todayLogs = [] } = usePracticeLogsForDate(today)
	const toggle = useTogglePractice()
	const { data: officeStatus } = useDailyOfficeStatus(today)
	const { data: allProgress = [] } = useAllReadingProgress()

	const completedIds = toCompletedSet(todayLogs)
	const nextHour = getNextOfficeHour(now, officeStatus)

	const progressItems = useMemo(
		() =>
			allProgress.map((p) => ({
				type: p.type,
				label: readingLabels[p.type] ?? p.type,
				percentage: getProgressPercentage({
					type: p.type,
					currentBook: p.current_book,
					currentChapter: p.current_chapter,
					completedBooks: p.completed_books,
					startDate: p.start_date,
				}),
			})),
		[allProgress],
	)

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$lg">
				<YStack gap="$xs">
					<Text fontFamily="$heading" fontSize="$5" color="$color">
						{greeting}
					</Text>
					<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
						{format(now, 'EEEE, MMMM d')}
					</Text>
				</YStack>

				{nextHour ? (
					<Pressable onPress={() => router.push(nextHour.route as never)}>
						<Card gap="$sm">
							<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
								Up next
							</Text>
							<Text fontFamily="$heading" fontSize="$4" color="$color">
								{nextHour.label}
							</Text>
							<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
								{nextHour.sublabel}
							</Text>
						</Card>
					</Pressable>
				) : (
					<Card gap="$sm" alignItems="center">
						<Text fontFamily="$heading" fontSize="$3" color="$accent">
							All offices complete
						</Text>
						<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
							Rest well tonight
						</Text>
					</Card>
				)}

				<XStack gap="$md" justifyContent="center">
					{hourOrder.map((hour) => {
						const done = officeStatus?.[hour] ?? false
						const meta = hourMeta[hour]
						return (
							<Pressable key={hour} onPress={() => router.push(meta.route as never)}>
								<YStack alignItems="center" gap="$xs">
									<YStack
										width={36}
										height={36}
										borderRadius={18}
										borderWidth={2}
										borderColor={done ? '$accent' : '$borderColor'}
										backgroundColor={done ? '$accent' : 'transparent'}
										alignItems="center"
										justifyContent="center"
									>
										{done && <Check size={18} color={theme.background.val} />}
									</YStack>
									<Text
										fontFamily="$body"
										fontSize="$1"
										color={done ? '$accent' : '$colorSecondary'}
									>
										{meta.sublabel}
									</Text>
								</YStack>
							</Pressable>
						)
					})}
				</XStack>

				{practices.length > 0 && (
					<YStack gap="$sm">
						<XStack justifyContent="space-between" alignItems="center">
							<Text fontFamily="$heading" fontSize="$3" color="$color">
								Today
							</Text>
							<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
								{completedIds.size} of {practices.length}
							</Text>
						</XStack>
						<PracticeChecklist
							practices={practices}
							completedIds={completedIds}
							onToggle={(id, completed) =>
								toggle.mutate({ practiceId: id, date: today, completed })
							}
						/>
						{completedIds.size === 0 && (
							<Text
								fontFamily="$body"
								fontSize="$2"
								color="$colorSecondary"
								textAlign="center"
								paddingVertical="$sm"
							>
								Begin your day with a single practice
							</Text>
						)}
					</YStack>
				)}

				{progressItems.length > 0 && (
					<YStack gap="$sm">
						<Text fontFamily="$heading" fontSize="$3" color="$color">
							Reading
						</Text>
						<Card gap="$md">
							{progressItems.map((item) => (
								<YStack key={item.type} gap="$xs">
									<XStack justifyContent="space-between" alignItems="center">
										<Text fontFamily="$body" fontSize="$2" color="$color">
											{item.label}
										</Text>
										<Text fontFamily="$body" fontSize="$1" color="$accent">
											{Math.round(item.percentage * 100)}%
										</Text>
									</XStack>
									<ProgressBar value={item.percentage} />
								</YStack>
							))}
						</Card>
					</YStack>
				)}
			</YStack>
		</ScreenLayout>
	)
}
