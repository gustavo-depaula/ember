// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { AnimatePresence, MotiView } from 'moti'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, XStack, YStack } from 'tamagui'

import { DropCap, PrayerText, RubricLabel, ScreenLayout, SectionDivider } from '@/components'
import type { Verse } from '@/lib/content'
import { cccDailyCount, type OfficeHour, type PrayerSection, readingTypeForHour } from '../engine'
import {
	type PsalmData,
	useAdvanceReading,
	useCompleteOfficeHour,
	useDailyOfficeStatus,
	usePrayerContent,
} from '../hooks'
import { formatPsalmRef } from '../psalter'

const hourLabels: Record<OfficeHour, string> = {
	morning: 'Morning Prayer',
	evening: 'Evening Prayer',
	compline: 'Night Prayer',
}

export function PrayerFlow({ hour, date }: { hour: OfficeHour; date: string }) {
	const router = useRouter()
	const theme = useTheme()

	const { sections, psalmData, readingData, cccData, isLoading } = usePrayerContent(hour, date)
	const completeHour = useCompleteOfficeHour()
	const advanceReading = useAdvanceReading()
	const { data: status } = useDailyOfficeStatus(date)

	const isCompleted = status?.[hour] ?? false
	const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy')

	if (isLoading) {
		return (
			<ScreenLayout>
				<YStack flex={1} alignItems="center" justifyContent="center">
					<Spinner size="large" color="$accent" />
				</YStack>
			</ScreenLayout>
		)
	}

	function handleComplete() {
		const readingType = readingTypeForHour[hour]
		const count = readingType === 'catechism' ? cccDailyCount : 1
		completeHour.mutate(
			{ date, hour },
			{
				onSuccess: () => {
					advanceReading.mutate({ type: readingType, count })
					router.back()
				},
			},
		)
	}

	return (
		<ScreenLayout>
			<YStack gap="$lg" paddingVertical="$md">
				<Pressable onPress={() => router.back()}>
					<XStack alignItems="center" gap="$sm">
						<ChevronLeft size={20} color={theme.accent.val} />
						<Text fontFamily="$body" fontSize="$2" color="$accent">
							Office
						</Text>
					</XStack>
				</Pressable>

				<YStack alignItems="center" gap="$xs" paddingVertical="$md">
					<Text fontFamily="$heading" fontSize="$5" color="$color">
						{hourLabels[hour]}
					</Text>
					<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
						{formattedDate}
					</Text>
				</YStack>

				{sections.map((section, index) => (
					<SectionBlock
						key={`${section.type}-${index}`}
						section={section}
						psalmData={psalmData}
						readingData={readingData?.verses}
						readingFallback={readingData?.fallback}
						cccData={cccData}
						isCompleted={isCompleted}
						isSubmitting={completeHour.isPending}
						onComplete={handleComplete}
					/>
				))}
			</YStack>
		</ScreenLayout>
	)
}

function SectionBlock({
	section,
	psalmData,
	readingData,
	readingFallback,
	cccData,
	isCompleted,
	isSubmitting,
	onComplete,
}: {
	section: PrayerSection
	psalmData: PsalmData[]
	readingData: Verse[] | undefined
	readingFallback?: boolean
	cccData: Array<{ number: number; text: string; section: string }> | undefined
	isCompleted: boolean
	isSubmitting: boolean
	onComplete: () => void
}) {
	switch (section.type) {
		case 'rubric':
			return <RubricLabel>{section.label}</RubricLabel>

		case 'prayer':
			return <PrayerTextBlock text={section.text} />

		case 'hymn':
			return <HymnBlock title={section.title} english={section.english} latin={section.latin} />

		case 'psalmody':
			return <PsalmodyBlock psalmData={psalmData} />

		case 'reading':
			if (section.reference.type === 'bible') {
				return (
					<BibleReadingBlock
						reference={section.reference}
						verses={readingData}
						fallback={readingFallback}
					/>
				)
			}
			return <CccReadingBlock reference={section.reference} paragraphs={cccData} />

		case 'canticle':
			return (
				<CanticleBlock
					title={section.title}
					subtitle={section.subtitle}
					source={section.source}
					text={section.text}
				/>
			)

		case 'divider':
			return <SectionDivider />

		case 'complete':
			return (
				<CompleteButton
					isCompleted={isCompleted}
					isSubmitting={isSubmitting}
					onComplete={onComplete}
				/>
			)

		default:
			return undefined
	}
}

function PrayerTextBlock({ text }: { text: string }) {
	const lines = text.split('\n')
	return (
		<YStack gap="$xs">
			{lines.map((line, i) => (
				<PrayerText key={`${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
			))}
		</YStack>
	)
}

function HymnBlock({ title, english, latin }: { title: string; english: string; latin: string }) {
	return (
		<YStack gap="$md">
			<Text fontFamily="$heading" fontSize="$3" color="$color">
				{title}
			</Text>
			<YStack gap="$xs">
				{english.split('\n').map((line, i) => (
					<PrayerText key={`en-${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
				))}
			</YStack>
			<YStack gap="$xs" opacity={0.6}>
				{latin.split('\n').map((line, i) => (
					<Text
						key={`la-${i}-${line.slice(0, 20)}`}
						fontFamily="$body"
						fontSize="$2"
						fontStyle="italic"
						color="$colorSecondary"
					>
						{line}
					</Text>
				))}
			</YStack>
		</YStack>
	)
}

function PsalmodyBlock({ psalmData }: { psalmData: PsalmData[] }) {
	if (psalmData.length === 0) return undefined

	return (
		<YStack gap="$lg">
			{psalmData.map((psalm, i) => (
				<YStack key={`${psalm.ref.psalm}-${i}`} gap="$sm">
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontWeight="500">
						{formatPsalmRef(psalm.ref)}
					</Text>
					{psalm.verses.length > 0 && (
						<>
							<DropCap text={psalm.verses[0].text} />
							{psalm.verses.slice(1).map((v) => (
								<PrayerText key={v.verse}>{v.text}</PrayerText>
							))}
						</>
					)}
				</YStack>
			))}
		</YStack>
	)
}

function BibleReadingBlock({
	reference,
	verses,
	fallback,
}: {
	reference: { type: 'bible'; book: string; bookName: string; chapter: number }
	verses: Verse[] | undefined
	fallback?: boolean
}) {
	if (!verses) return undefined

	return (
		<YStack gap="$sm">
			{fallback && (
				<XStack backgroundColor="$backgroundSurface" borderRadius="$md" padding="$sm">
					<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
						Showing Douay-Rheims (offline) — selected translation unavailable
					</Text>
				</XStack>
			)}
			<Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontWeight="500">
				{reference.bookName} {reference.chapter}
			</Text>
			{verses.length > 0 && (
				<>
					<DropCap text={verses[0].text} />
					{verses.slice(1).map((v) => (
						<PrayerText key={v.verse}>{v.text}</PrayerText>
					))}
				</>
			)}
		</YStack>
	)
}

function CccReadingBlock({
	reference,
	paragraphs,
}: {
	reference: { type: 'catechism'; startParagraph: number; count: number }
	paragraphs: Array<{ number: number; text: string; section: string }> | undefined
}) {
	if (!paragraphs || paragraphs.length === 0) return undefined

	const endParagraph = reference.startParagraph + reference.count - 1

	return (
		<YStack gap="$sm">
			<Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontWeight="500">
				Catechism of the Catholic Church, {reference.startParagraph}-{endParagraph}
			</Text>
			{paragraphs.map((p) => (
				<XStack key={p.number} gap="$sm" alignItems="flex-start">
					<Text fontFamily="$body" fontSize="$1" color="$accent" fontWeight="600" width={36}>
						{p.number}
					</Text>
					<PrayerText flex={1}>{p.text}</PrayerText>
				</XStack>
			))}
		</YStack>
	)
}

function CanticleBlock({
	title,
	subtitle,
	source,
	text,
}: {
	title: string
	subtitle: string
	source: string
	text: string
}) {
	const lines = text.split('\n')
	return (
		<YStack gap="$sm">
			<Text fontFamily="$heading" fontSize="$3" color="$color">
				{title}
			</Text>
			<Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
				{subtitle} ({source})
			</Text>
			<DropCap text={lines[0]} />
			{lines.slice(1).map((line, i) => (
				<PrayerText key={`${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
			))}
		</YStack>
	)
}

function CompleteButton({
	isCompleted,
	isSubmitting,
	onComplete,
}: {
	isCompleted: boolean
	isSubmitting: boolean
	onComplete: () => void
}) {
	return (
		<AnimatePresence exitBeforeEnter>
			{isCompleted ? (
				<MotiView
					key="completed"
					from={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: 'spring', damping: 15, stiffness: 200 }}
				>
					<YStack alignItems="center" paddingVertical="$lg">
						<Text fontFamily="$body" fontSize="$3" color="$accent">
							Completed
						</Text>
					</YStack>
				</MotiView>
			) : (
				<MotiView key="button" from={{ opacity: 0 }} animate={{ opacity: 1 }}>
					<Pressable onPress={onComplete} disabled={isSubmitting}>
						<YStack
							backgroundColor="$accent"
							borderRadius="$lg"
							paddingVertical="$md"
							alignItems="center"
							opacity={isSubmitting ? 0.6 : 1}
						>
							<Text fontFamily="$heading" fontSize="$3" color="$background">
								{isSubmitting ? 'Completing...' : 'Mark as Complete'}
							</Text>
						</YStack>
					</Pressable>
				</MotiView>
			)}
		</AnimatePresence>
	)
}
