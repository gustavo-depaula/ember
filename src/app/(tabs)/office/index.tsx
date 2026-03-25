import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import type { ReadingProgress } from '@/db/schema'
import { useAllReadingProgress, useDailyOfficeStatus } from '@/features/divine-office'
import { type OfficeHour, readingTypeForHour } from '@/features/divine-office/engine'
import {
	formatPsalmRefs,
	getComplinePsalms,
	getPsalmsForDay,
} from '@/features/divine-office/psalter'
import { getPsalmNumbering } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import { usePreferencesStore } from '@/stores/preferencesStore'

const hourConfig = [
	{
		hour: 'morning' as const,
		label: 'Morning Prayer',
		sublabel: 'Lauds',
		route: '/office/morning',
	},
	{
		hour: 'evening' as const,
		label: 'Evening Prayer',
		sublabel: 'Vespers',
		route: '/office/evening',
	},
	{
		hour: 'compline' as const,
		label: 'Night Prayer',
		sublabel: 'Compline',
		route: '/office/compline',
	},
]

function getReadingLabel(hour: OfficeHour, progressMap: Map<string, ReadingProgress>): string {
	const type = readingTypeForHour[hour]
	const progress = progressMap.get(type)
	if (!progress) return ''

	if (type === 'catechism') {
		return `CCC ${progress.current_chapter}-${progress.current_chapter + 7}`
	}

	const books = getDrbBooks()
	const book = books.find((b) => b.id === progress.current_book)
	return `${book?.name ?? progress.current_book} ${progress.current_chapter}`
}

export default function OfficeScreen() {
	const router = useRouter()

	const todayDate = useMemo(() => new Date(), [])
	const today = useMemo(() => format(todayDate, 'yyyy-MM-dd'), [todayDate])
	const translation = usePreferencesStore((s) => s.translation)
	const numbering = getPsalmNumbering(translation)

	const { data: status } = useDailyOfficeStatus(today)
	const { data: allProgress = [] } = useAllReadingProgress()

	const progressMap = useMemo(
		() => new Map(allProgress.map((p): [string, ReadingProgress] => [p.type, p])),
		[allProgress],
	)

	const psalmsForDay = useMemo(() => getPsalmsForDay(todayDate, numbering), [todayDate, numbering])
	const complinePsalms = useMemo(
		() => getComplinePsalms(todayDate, numbering),
		[todayDate, numbering],
	)

	function getPsalmLabel(hour: OfficeHour): string {
		if (hour === 'morning') return formatPsalmRefs(psalmsForDay.morning)
		if (hour === 'evening') return formatPsalmRefs(psalmsForDay.evening)
		return formatPsalmRefs(complinePsalms)
	}

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$lg">
				<YStack gap="$xs">
					<Text fontFamily="$heading" fontSize="$5" color="$color">
						Divine Office
					</Text>
					<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
						{format(todayDate, 'EEEE, MMMM d')}
					</Text>
				</YStack>

				{hourConfig.map(({ hour, label, sublabel, route }) => {
					const completed = status?.[hour] ?? false
					const readingLabel = getReadingLabel(hour, progressMap)
					const psalmLabel = getPsalmLabel(hour)

					return (
						<Pressable key={hour} onPress={() => router.push(route as never)}>
							<YStack
								backgroundColor="$backgroundSurface"
								borderRadius="$lg"
								padding="$md"
								gap="$sm"
							>
								<XStack alignItems="center" justifyContent="space-between">
									<YStack>
										<Text fontFamily="$heading" fontSize="$3" color="$color">
											{label}
										</Text>
										<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
											{sublabel}
										</Text>
									</YStack>
									{completed ? (
										<Text fontFamily="$body" fontSize="$2" color="$accent">
											Done
										</Text>
									) : undefined}
								</XStack>

								{readingLabel ? (
									<Text fontFamily="$body" fontSize="$2" color="$color">
										{readingLabel}
									</Text>
								) : undefined}
								{psalmLabel ? (
									<Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
										{psalmLabel}
									</Text>
								) : undefined}
							</YStack>
						</Pressable>
					)
				})}
			</YStack>
		</ScreenLayout>
	)
}
