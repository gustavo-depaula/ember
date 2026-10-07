// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import { type UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'
import { AnimatedPressable, PrimitiveBlock, ScreenLayout, Typography } from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import type { PracticeManifest } from '@/content/manifestTypes'
import { PreprocessProvider } from '@/content/preprocessRuntime'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { ProgramCompleteModal } from '@/features/practices/components/ProgramCompleteModal'
import { useProgressiveCount } from '@/hooks/useProgressiveCount'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { useStableToday, useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePractice } from './hooks/usePractice'
import type { usePracticeCompletion } from './hooks/usePracticeCompletion'
import type { PracticeContent } from './hooks/usePracticeContent'
import {
  PracticeActionIcons,
  PracticeActionSheets,
  PracticeVariant,
  usePracticeActions,
} from './PracticeActions'
import { derivePracticeFlowStatus } from './status'

type CompletionApi = ReturnType<typeof usePracticeCompletion>

type Props = {
  practiceId: string
  programDayProp: number | undefined
  readOnly: boolean
  contentQuery: UseQueryResult<PracticeContent>
  completion: CompletionApi
  onSelectOverride: (overrideKey: string, nextId: string) => void
}

// Stable identity: useProgressiveCount resets on every new sections array, so a
// fresh `[]` per render would loop forever.
const noSections: PracticeContent['primitives'] = []

export function PracticeFlowView({
  practiceId,
  programDayProp,
  readOnly,
  contentQuery,
  completion,
  onSelectOverride,
}: Props) {
  const router = useRouter()
  const { manifest, flow, flowQuery, programDay } = usePractice(practiceId, programDayProp)

  const status = derivePracticeFlowStatus({
    manifest,
    flow,
    flowQuery,
    contentQuery,
  })

  switch (status.kind) {
    case 'loading':
      // derivePracticeFlowStatus guarantees manifest is defined here.
      if (!manifest) return null
      return <PracticeLoading manifest={manifest} />
    case 'missing':
      return <PracticeMissing onBack={() => router.back()} />
    case 'content-error':
      return <PracticeContentError onRetry={() => contentQuery.refetch()} />
    case 'ready':
      // derivePracticeFlowStatus guarantees manifest is defined here.
      if (!manifest) return null
      return (
        <PracticeReady
          manifest={manifest}
          practiceId={practiceId}
          programDay={programDay}
          readOnly={readOnly}
          sections={contentQuery.data?.primitives ?? noSections}
          completion={completion}
          onSelectOverride={onSelectOverride}
        />
      )
  }
}

function PracticeReady({
  manifest,
  practiceId,
  programDay,
  readOnly,
  sections,
  completion,
  onSelectOverride,
}: {
  manifest: PracticeManifest
  practiceId: string
  programDay: number | undefined
  readOnly: boolean
  sections: PracticeContent['primitives']
  completion: CompletionApi
  onSelectOverride: (overrideKey: string, nextId: string) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const now = useToday()
  const realToday = useStableToday()
  const isFutureDate = now.getTime() > realToday.getTime()
  const readingMargin = useReadingMargin()
  const practiceName = localizeContent(manifest.name)
  const actions = usePracticeActions(manifest)

  // Mount the primitive tree in chunks: long practices (Mass, offices) render
  // hundreds of blocks, and mounting them all at once blocks the JS thread
  // through the whole navigation. Keyed by array identity so a language or
  // translation switch restarts the chunking.
  const visibleCount = useProgressiveCount(sections.length, sections)

  // Runtime for lazily preprocessing a select branch the user switches to.
  const queryClient = useQueryClient()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const translation = usePreferencesStore((s) => s.translation)
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  const preprocessCtx = useMemo(
    () => ({
      queryClient,
      prefs: { lang: contentLanguage, translation, jurisdiction },
      date: now,
      programDay,
    }),
    [queryClient, contentLanguage, translation, jurisdiction, now, programDay],
  )

  return (
    <PreprocessProvider value={preprocessCtx}>
      <ImageViewerProvider>
        <YStack flex={1}>
          <ScreenLayout>
            <YStack gap="$lg" paddingVertical="$lg">
              <PracticeHeader
                name={practiceName}
                caption={formatLocalized(now, t('practice.headerDate')).toLocaleLowerCase()}
                variant={<PracticeVariant actions={actions} />}
                actions={<PracticeActionIcons actions={actions} />}
                onBack={() => router.back()}
              />

              <YStack gap="$md" paddingHorizontal={readingMargin} paddingTop="$md">
                {sections.slice(0, visibleCount).map((primitive, index) => (
                  <PrimitiveBlock
                    key={`${primitive.type}-${index}`}
                    primitive={primitive}
                    practiceId={practiceId}
                    onSelectOverride={onSelectOverride}
                  />
                ))}
              </YStack>

              {manifest.completion !== 'manual' && !isFutureDate && !readOnly && (
                <YStack paddingHorizontal={readingMargin} paddingTop="$lg">
                  <AnimatedPressable
                    onPress={completion.handleComplete}
                    disabled={completion.isCompleting}
                    accessibilityRole="button"
                    accessibilityLabel={t('office.amen')}
                  >
                    <YStack
                      backgroundColor="$accent"
                      borderRadius="$md"
                      borderWidth={1}
                      borderColor="$accentSubtle"
                      paddingVertical="$md"
                      alignItems="center"
                      opacity={completion.isCompleting ? 0.6 : 1}
                    >
                      <Typography fontSize="$3" fontWeight="500" color="$background">
                        {completion.isCompleting ? t('office.completing') : t('office.amen')}
                      </Typography>
                    </YStack>
                  </AnimatedPressable>
                </YStack>
              )}

              <YStack paddingBottom="$lg" />
            </YStack>

            {completion.showCompleteModal && manifest.program && (
              <ProgramCompleteModal
                practiceName={practiceName}
                showRestart={manifest.program.completionBehavior === 'offer-restart'}
                onRestart={completion.onRestart}
                onDone={completion.dismissCompleteModal}
              />
            )}
          </ScreenLayout>

          <PracticeActionSheets actions={actions} />
        </YStack>
      </ImageViewerProvider>
    </PreprocessProvider>
  )
}

// The real header over a skeleton of the page, so nothing above the fold moves
// when the prayers arrive. External fetches (Compendium → vatican.va, Bible
// chapters → a publisher's site) can hold this for several seconds.
function PracticeLoading({ manifest }: { manifest: PracticeManifest }) {
  const { t } = useTranslation()
  const router = useRouter()
  const now = useToday()
  const readingMargin = useReadingMargin()
  const actions = usePracticeActions(manifest)
  return (
    <YStack flex={1}>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <PracticeHeader
            name={localizeContent(manifest.name)}
            caption={formatLocalized(now, t('practice.headerDate')).toLocaleLowerCase()}
            variant={<PracticeVariant actions={actions} />}
            actions={<PracticeActionIcons actions={actions} />}
            onBack={() => router.back()}
          />
          <YStack
            paddingHorizontal={readingMargin}
            paddingTop="$md"
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t('practice.loadingContent')}
          >
            <PageSkeleton />
          </YStack>
        </YStack>
      </ScreenLayout>
      <PracticeActionSheets actions={actions} />
    </YStack>
  )
}

// A printed page in outline: rubric, section title, justified paragraphs with a
// short last line, a centred rule between sections. Ink wash, breathing slowly.
function PageSkeleton() {
  const breath = useSharedValue(1)

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(0.45, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    )
  }, [breath])

  const style = useAnimatedStyle(() => ({ opacity: breath.value }))

  return (
    <Animated.View style={style}>
      <YStack gap="$xl">
        <SkeletonSection lines={['100%', '100%', '100%', '62%']} rubric />
        <YStack alignSelf="center" width={96} height={0.5} backgroundColor="$borderColor" />
        <SkeletonSection lines={['100%', '100%', '100%', '100%', '38%']} />
      </YStack>
    </Animated.View>
  )
}

function SkeletonSection({ lines, rubric = false }: { lines: `${number}%`[]; rubric?: boolean }) {
  return (
    <YStack gap="$md">
      {rubric && <SkeletonLine width="28%" height={9} color="$colorBurgundy" opacity={0.35} />}
      <SkeletonLine width="52%" height={20} />
      <YStack gap={14} paddingTop="$xs">
        {lines.map((width, index) => (
          <SkeletonLine key={index} width={width} height={9} />
        ))}
      </YStack>
    </YStack>
  )
}

function SkeletonLine({
  width,
  height,
  color = '$color',
  opacity = 0.1,
}: {
  width: `${number}%`
  height: number
  color?: '$color' | '$colorBurgundy'
  opacity?: number
}) {
  return (
    <YStack
      width={width}
      height={height}
      borderRadius={2}
      backgroundColor={color}
      opacity={opacity}
    />
  )
}

function PracticeMissing({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <ScreenLayout>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
        <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
          {t('practice.noContent')}
        </Text>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text fontFamily="$body" fontSize="$2" color="$accent">
            {t('common.back')}
          </Text>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}

function PracticeContentError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <ScreenLayout>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" padding="$lg">
        <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
          {t('practice.contentLoadFailed')}
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <Text fontFamily="$body" fontSize="$2" color="$accent">
            {t('common.retry')}
          </Text>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
