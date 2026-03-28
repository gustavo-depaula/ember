// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  BibleReadingBlock,
  CanticleBlock,
  CccReadingBlock,
  HeaderFlourish,
  HymnBlock,
  ManuscriptFrame,
  OrnamentalRule,
  PageBreakOrnament,
  PrayerTextBlock,
  type PsalmData,
  PsalmodyBlock,
  RubricLabel,
  ScreenLayout,
} from '@/components'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'
import { successBuzz } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { cccDailyCount, type OfficeHour, type PrayerSection, readingTypeForHour } from '../engine'
import {
  useAdvanceReading,
  useCompleteOfficeHour,
  useDailyOfficeStatus,
  usePrayerContent,
} from '../hooks'

const hourLabelKeys: Record<OfficeHour, string> = {
  morning: 'office.morningPrayer',
  evening: 'office.eveningPrayer',
  compline: 'office.nightPrayer',
}

export function PrayerFlow({ hour, date }: { hour: OfficeHour; date: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const readingMargin = useReadingMargin()
  const { sections, psalmData, readingData, cccData, isLoading } = usePrayerContent(hour, date)
  const completeHour = useCompleteOfficeHour()
  const advanceReading = useAdvanceReading()
  const { data: status } = useDailyOfficeStatus(date)

  const isCompleted = status?.[hour] ?? false
  const formattedDate = formatLocalized(new Date(date), 'EEEE, MMMM d, yyyy')

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
          successBuzz()
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
              {t('office.back')}
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
              {t(hourLabelKeys[hour])}
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

function CompleteButton({
  isCompleted,
  isSubmitting,
  onComplete,
}: {
  isCompleted: boolean
  isSubmitting: boolean
  onComplete: () => void
}) {
  const { t } = useTranslation()
  if (isCompleted) {
    return (
      <YStack alignItems="center" paddingVertical="$lg">
        <Text fontFamily="$body" fontSize="$3" color="$colorGreen">
          {t('office.completed')}
        </Text>
      </YStack>
    )
  }

  return (
    <AnimatedPressable onPress={onComplete} disabled={isSubmitting}>
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
          {isSubmitting ? t('office.completing') : t('office.markComplete')}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}
