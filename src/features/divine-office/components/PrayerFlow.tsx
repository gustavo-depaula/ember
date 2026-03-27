// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, XStack, YStack } from 'tamagui'

import {
  DropCap,
  HeaderFlourish,
  IlluminatedInitial,
  ManuscriptFrame,
  OrnamentalRule,
  PageBreakOrnament,
  PrayerText,
  RubricLabel,
  ScreenLayout,
  VineBar,
} from '@/components'
import { useReadingMargin } from '@/hooks/useReadingStyle'
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

  const readingMargin = useReadingMargin()
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

        <ManuscriptFrame>
          <YStack
            alignItems="center"
            gap="$xs"
            paddingVertical="$md"
            paddingHorizontal={readingMargin}
          >
            <HeaderFlourish />
            <Text fontFamily="$display" fontSize={36} lineHeight={42} color="$colorBurgundy">
              {hourLabels[hour]}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
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
              isFirstReading={
                section.type === 'reading' &&
                index === sections.findIndex((s) => s.type === 'reading')
              }
            />
          ))}
        </ManuscriptFrame>
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
  isFirstReading = false,
}: {
  section: PrayerSection
  psalmData: PsalmData[]
  readingData: Verse[] | undefined
  readingFallback?: boolean
  cccData: Array<{ number: number; text: string; section: string }> | undefined
  isCompleted: boolean
  isSubmitting: boolean
  onComplete: () => void
  isFirstReading?: boolean
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
      if (isFirstReading) {
        return (
          <>
            <PageBreakOrnament />
            {section.reference.type === 'bible' ? (
              <BibleReadingBlock
                reference={section.reference}
                verses={readingData}
                fallback={readingFallback}
                illuminated
              />
            ) : (
              <CccReadingBlock reference={section.reference} paragraphs={cccData} />
            )}
          </>
        )
      }
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
      return <OrnamentalRule />

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
  const englishLines = english.split('\n')
  const latinLines = latin.split('\n')
  const totalLines = englishLines.length + latinLines.length
  const estimatedHeight = totalLines * 24 + 40

  return (
    <XStack gap="$sm">
      <VineBar height={estimatedHeight} />
      <YStack gap="$md" flex={1}>
        <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
          {title}
        </Text>
        <YStack gap="$xs">
          {englishLines.map((line, i) => (
            <PrayerText key={`en-${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
          ))}
        </YStack>
        <YStack gap="$xs" opacity={0.6}>
          {latinLines.map((line, i) => (
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
    </XStack>
  )
}

function PsalmodyBlock({ psalmData }: { psalmData: PsalmData[] }) {
  if (psalmData.length === 0) return undefined

  return (
    <YStack gap="$lg">
      {psalmData.map((psalm, i) => (
        <YStack key={`${psalm.ref.psalm}-${i}`} gap="$sm">
          <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue" fontWeight="500">
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
  illuminated = false,
}: {
  reference: { type: 'bible'; book: string; bookName: string; chapter: number }
  verses: Verse[] | undefined
  fallback?: boolean
  illuminated?: boolean
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
      <Text fontFamily="$body" fontSize="$2" color="$colorMutedBlue" fontWeight="500">
        {reference.bookName} {reference.chapter}
      </Text>
      {verses.length > 0 && (
        <>
          {illuminated ? (
            <IlluminatedInitial text={verses[0].text} />
          ) : (
            <DropCap text={verses[0].text} />
          )}
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
      <Text fontFamily="$body" fontSize="$2" color="$colorMutedBlue" fontWeight="500">
        Catechism of the Catholic Church, {reference.startParagraph}-{endParagraph}
      </Text>
      {paragraphs.map((p) => (
        <XStack key={p.number} gap="$sm" alignItems="flex-start">
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorMutedBlue"
            fontWeight="600"
            width={36}
          >
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
      <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy" letterSpacing={0.5}>
        {title}
      </Text>
      <Text fontFamily="$body" fontSize="$1" color="$colorMutedBlue">
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
  if (isCompleted) {
    return (
      <YStack alignItems="center" paddingVertical="$lg">
        <Text fontFamily="$body" fontSize="$3" color="$colorGreen">
          Completed
        </Text>
      </YStack>
    )
  }

  return (
    <Pressable onPress={onComplete} disabled={isSubmitting}>
      <YStack
        backgroundColor="$accent"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$accentSubtle"
        paddingVertical="$md"
        alignItems="center"
        opacity={isSubmitting ? 0.6 : 1}
      >
        <Text fontFamily="$heading" fontSize="$3" color="$background">
          {isSubmitting ? 'Completing...' : 'Mark as Complete'}
        </Text>
      </YStack>
    </Pressable>
  )
}
