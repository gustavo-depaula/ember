import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { BackToHome, HeaderFlourish, ProgressBar, ScreenLayout, SectionDivider } from '@/components'
import type { ReadingProgress } from '@/db/schema'
import { useAllReadingProgress } from '@/features/divine-office'
import { getEstimatedCompletion, getProgressPercentage } from '@/features/divine-office/utils'
import { availableTranslations } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useThemeStore } from '@/stores/themeStore'

const themeOptions = [
	{ value: 'light' as const, label: 'Light' },
	{ value: 'dark' as const, label: 'Dark' },
	{ value: 'system' as const, label: 'System' },
]

const readingLabels: Record<string, string> = {
	ot: 'Old Testament',
	nt: 'New Testament',
	catechism: 'Catechism',
}

function getPositionLabel(progress: ReadingProgress): string {
	if (progress.type === 'catechism') {
		return `CCC §${progress.current_chapter}`
	}
	const books = getDrbBooks()
	const book = books.find((b) => b.id === progress.current_book)
	return `${book?.name ?? progress.current_book} ${progress.current_chapter}`
}

function getBookCount(progress: ReadingProgress): string | undefined {
	if (progress.type === 'catechism') return undefined
	const testament = progress.type as 'ot' | 'nt'
	const books = getDrbBooks().filter((b) => b.testament === testament)
	const completed: string[] = JSON.parse(progress.completed_books)
	return `${completed.length} of ${books.length} books`
}

export default function SettingsScreen() {
	const router = useRouter()
	const translation = usePreferencesStore((s) => s.translation)
	const setTranslation = usePreferencesStore((s) => s.setTranslation)
	const themePreference = useThemeStore((s) => s.preference)
	const setTheme = useThemeStore((s) => s.setTheme)

	const { data: allProgress = [] } = useAllReadingProgress()

	const progressItems = useMemo(
		() =>
			allProgress.map((p) => {
				const row = {
					type: p.type,
					currentBook: p.current_book,
					currentChapter: p.current_chapter,
					completedBooks: p.completed_books,
					startDate: p.start_date,
				}
				return {
					type: p.type,
					label: readingLabels[p.type] ?? p.type,
					percentage: getProgressPercentage(row),
					position: getPositionLabel(p),
					bookCount: getBookCount(p),
					estimated: format(getEstimatedCompletion(row), 'MMM yyyy'),
				}
			}),
		[allProgress],
	)

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$lg">
				<BackToHome />
				<YStack alignItems="center" gap="$xs">
					<HeaderFlourish />
					<Text fontFamily="$display" fontSize={28} lineHeight={34} color="$color">
						Settings
					</Text>
				</YStack>

				<YStack gap="$md">
					<Text fontFamily="$heading" fontSize="$3" color="$color">
						Reading Progress
					</Text>
					{progressItems.map((item) => (
						<YStack
							key={item.type}
							backgroundColor="$backgroundSurface"
							borderRadius="$lg"
							padding="$md"
							gap="$sm"
						>
							<XStack justifyContent="space-between" alignItems="center">
								<Text fontFamily="$heading" fontSize="$2" color="$color">
									{item.label}
								</Text>
								<Text fontFamily="$body" fontSize="$1" color="$accent">
									{Math.round(item.percentage * 100)}%
								</Text>
							</XStack>
							<ProgressBar value={item.percentage} />
							<XStack alignItems="center" justifyContent="space-between">
								<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
									{item.position}
								</Text>
								<Pressable
									onPress={() => router.push(`/settings/position?type=${item.type}` as never)}
								>
									<Text fontFamily="$body" fontSize="$1" color="$accent">
										Change
									</Text>
								</Pressable>
							</XStack>
							{item.bookCount ? (
								<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
									{item.bookCount}
								</Text>
							) : undefined}
							<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
								Est. completion: {item.estimated}
							</Text>
						</YStack>
					))}
				</YStack>

				<SectionDivider />

				<YStack gap="$md">
					<Text fontFamily="$heading" fontSize="$3" color="$color">
						Bible Translation
					</Text>
					{availableTranslations.map((t) => {
						const selected = translation === t.code
						return (
							<Pressable key={t.code} onPress={() => setTranslation(t.code)}>
								<XStack
									backgroundColor={selected ? '$accent' : '$backgroundSurface'}
									borderRadius="$lg"
									padding="$md"
									alignItems="center"
									justifyContent="space-between"
								>
									<YStack>
										<Text
											fontFamily="$body"
											fontSize="$2"
											color={selected ? '$background' : '$color'}
										>
											{t.name}
										</Text>
										<Text
											fontFamily="$body"
											fontSize="$1"
											color={selected ? '$background' : '$colorSecondary'}
											opacity={selected ? 0.8 : 1}
										>
											{t.source === 'bundled' ? 'Bundled (offline)' : 'Online'}
										</Text>
									</YStack>
								</XStack>
							</Pressable>
						)
					})}
				</YStack>

				<SectionDivider />

				<YStack gap="$md">
					<Text fontFamily="$heading" fontSize="$3" color="$color">
						Theme
					</Text>
					<XStack gap="$sm">
						{themeOptions.map((opt) => {
							const selected = themePreference === opt.value
							return (
								<Pressable key={opt.value} onPress={() => setTheme(opt.value)}>
									<YStack
										backgroundColor={selected ? '$accent' : '$backgroundSurface'}
										borderRadius="$lg"
										paddingVertical="$sm"
										paddingHorizontal="$md"
										alignItems="center"
									>
										<Text
											fontFamily="$body"
											fontSize="$2"
											color={selected ? '$background' : '$color'}
										>
											{opt.label}
										</Text>
									</YStack>
								</Pressable>
							)
						})}
					</XStack>
				</YStack>

				<SectionDivider />

				<Pressable onPress={() => router.push('/settings/books' as never)}>
					<XStack
						backgroundColor="$backgroundSurface"
						borderRadius="$lg"
						padding="$md"
						alignItems="center"
						justifyContent="space-between"
					>
						<YStack>
							<Text fontFamily="$body" fontSize="$2" color="$color">
								Mark Books as Already Read
							</Text>
							<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
								Update your starting position
							</Text>
						</YStack>
						<Text fontFamily="$body" fontSize="$2" color="$accent">
							→
						</Text>
					</XStack>
				</Pressable>

				<SectionDivider />

				<YStack gap="$sm">
					<Text fontFamily="$heading" fontSize="$3" color="$color">
						Attribution
					</Text>
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
						Bible text: Douay-Rheims Bible (public domain)
					</Text>
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
						Catechism of the Catholic Church (USCCB)
					</Text>
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
						Online translations via Bolls.life API
					</Text>
				</YStack>
			</YStack>
		</ScreenLayout>
	)
}
