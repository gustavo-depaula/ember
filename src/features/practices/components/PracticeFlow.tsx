// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Spinner, Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  BibleReadingBlock,
  CanticleBlock,
  CccReadingBlock,
  CollapsiblePrayer,
  HeaderFlourish,
  HymnBlock,
  ManuscriptFrame,
  OrnamentalRule,
  PrayerTextBlock,
  type PsalmData,
  PsalmodyBlock,
  ResponseBlock,
  RubricLabel,
  ScreenLayout,
} from '@/components'
import { type FlowContext, resolveFlow } from '@/content/engine'
import {
  getDefaultVariant,
  getManifest,
  loadFlow,
  loadHourFlow,
  loadVariant,
} from '@/content/practices'
import type { RenderedSection } from '@/content/types'
import {
  useAllReadingProgress,
  useBibleReading,
  useCccReading,
  usePsalmsForHour,
} from '@/features/divine-office'
import { usePractices, useTogglePractice } from '@/features/plan-of-life'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { getPsalmNumbering } from '@/lib/bolls'
import type { Verse } from '@/lib/content'
import { successBuzz } from '@/lib/haptics'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { PsalmRef, ReadingReference } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

function findPsalmRefs(sections: RenderedSection[]): PsalmRef[] {
  for (const s of sections) {
    if (s.type === 'psalmody') return s.psalms
  }
  return []
}

function findReadingRef(sections: RenderedSection[]): ReadingReference | undefined {
  for (const s of sections) {
    if (s.type === 'reading') return s.reference
  }
  return undefined
}

export function PracticeFlow({ practiceId, hourId }: { practiceId: string; hourId?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const readingMargin = useReadingMargin()
  const togglePractice = useTogglePractice()

  const manifest = getManifest(practiceId)
  const flow = useMemo(() => {
    if (!manifest) return undefined
    if (hourId && manifest.hours) return loadHourFlow(practiceId, hourId)
    return loadFlow(practiceId)
  }, [manifest, practiceId, hourId])

  const { data: practices = [] } = usePractices()
  const selectedVariantId = practices.find((p) => p.id === practiceId)?.selected_variant

  const variant = useMemo(() => {
    if (!manifest?.variants?.length) return undefined
    if (selectedVariantId) return loadVariant(practiceId, selectedVariantId)
    return getDefaultVariant(practiceId)
  }, [practiceId, manifest, selectedVariantId])

  const now = useMemo(() => new Date(), [])

  // Dynamic context for psalter/lectio/seasonal sections
  const translation = usePreferencesStore((s) => s.translation)
  const numbering = getPsalmNumbering(translation)
  const { data: allProgress } = useAllReadingProgress()

  const readingProgress = useMemo(() => {
    if (!allProgress) return undefined
    return {
      ot: allProgress.find((p) => p.type === 'ot') ?? null,
      nt: allProgress.find((p) => p.type === 'nt') ?? null,
      catechism: allProgress.find((p) => p.type === 'catechism') ?? null,
    }
  }, [allProgress])

  const sections = useMemo(() => {
    if (!flow) return []
    const context: FlowContext = { date: now, variant, numbering, readingProgress }
    return resolveFlow(flow, context)
  }, [flow, now, variant, numbering, readingProgress])

  // Load dynamic content (psalms, Bible readings, CCC)
  const psalmRefs = useMemo(() => findPsalmRefs(sections), [sections])
  const readingRef = useMemo(() => findReadingRef(sections), [sections])
  const bibleRef = readingRef?.type === 'bible' ? readingRef : undefined
  const cccRef = readingRef?.type === 'catechism' ? readingRef : undefined

  const psalmResult = usePsalmsForHour(psalmRefs, translation)
  const bibleResult = useBibleReading(bibleRef?.book, bibleRef?.chapter, translation)
  const cccResult = useCccReading(cccRef?.startParagraph, cccRef?.count)

  const hasDynamicContent = psalmRefs.length > 0 || readingRef !== undefined
  const isDynamicLoading =
    hasDynamicContent && (psalmResult.isLoading || bibleResult.isLoading || cccResult.isLoading)

  const practiceName = t(`practice.${practiceId}`, {
    defaultValue: manifest?.name.en ?? practiceId,
  })
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')

  if (!manifest || !flow) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
            {t('practice.noContent')}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              {t('common.back')}
            </Text>
          </Pressable>
        </YStack>
      </ScreenLayout>
    )
  }

  if (isDynamicLoading) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$accent" />
        </YStack>
      </ScreenLayout>
    )
  }

  function handleComplete() {
    const today = format(new Date(), 'yyyy-MM-dd')
    togglePractice.mutate(
      { practiceId, date: today, completed: true },
      {
        onSuccess: () => {
          successBuzz()
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
              {t('common.back')}
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
              {practiceName}
            </Text>
            <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
              {formattedDate}
            </Text>
          </YStack>

          <YStack gap="$md">
            {sections.map((section, index) => (
              <PracticeSectionBlock
                key={`${section.type}-${index}`}
                section={section}
                psalmData={psalmResult.data}
                readingData={bibleResult.data?.verses}
                readingFallback={bibleResult.data?.fallback}
                cccData={cccResult.data}
              />
            ))}
          </YStack>

          <YStack paddingVertical="$lg" paddingHorizontal={readingMargin}>
            <AnimatedPressable onPress={handleComplete} disabled={togglePractice.isPending}>
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$accentSubtle"
                paddingVertical="$md"
                alignItems="center"
                opacity={togglePractice.isPending ? 0.6 : 1}
              >
                <Text fontFamily="$heading" fontSize="$3" color="$background">
                  {togglePractice.isPending
                    ? t('office.completing', { defaultValue: 'Completing...' })
                    : t('office.markComplete', { defaultValue: 'Mark Complete' })}
                </Text>
              </YStack>
            </AnimatedPressable>
          </YStack>
        </ManuscriptFrame>
      </YStack>
    </ScreenLayout>
  )
}

function PracticeSectionBlock({
  section,
  psalmData,
  readingData,
  readingFallback,
  cccData,
}: {
  section: RenderedSection
  psalmData: PsalmData[]
  readingData?: Verse[]
  readingFallback?: boolean
  cccData?: Array<{ number: number; text: string; section: string }>
}) {
  switch (section.type) {
    case 'rubric':
      return <RubricLabel>{section.label}</RubricLabel>

    case 'prayer':
      if (section.title) {
        return <CollapsiblePrayer title={section.title} text={section.text} count={section.count} />
      }
      return <PrayerTextBlock text={section.text} />

    case 'hymn':
      return <HymnBlock title={section.title} english={section.english} latin={section.latin} />

    case 'canticle':
      return (
        <CanticleBlock
          title={section.title}
          subtitle={section.subtitle}
          source={section.source}
          text={section.text}
        />
      )

    case 'response':
      return <ResponseBlock verses={section.verses} />

    case 'heading':
      return (
        <Text fontFamily="$heading" fontSize="$4" color="$colorBurgundy" letterSpacing={0.5}>
          {section.text}
        </Text>
      )

    case 'meditation':
      return (
        <Text fontFamily="$body" fontSize="$3" fontStyle="italic" color="$color" lineHeight={30}>
          {section.text}
        </Text>
      )

    case 'divider':
      return <OrnamentalRule />

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

    case 'image':
      return null

    default:
      return null
  }
}
