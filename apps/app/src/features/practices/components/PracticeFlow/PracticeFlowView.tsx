// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import { type UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ChevronLeft, Type } from 'lucide-react-native'
import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, useThemeName, YStack } from 'tamagui'
import {
  AnimatedPressable,
  GlassSurface,
  ManuscriptFrame,
  PrimitiveBlock,
  ScreenLayout,
  Threshold,
  Typography,
} from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import type { PracticeManifest } from '@/content/manifestTypes'
import { PreprocessProvider } from '@/content/preprocessRuntime'
import { ProgramCompleteModal } from '@/features/practices/components/ProgramCompleteModal'
import { ReadingSettingsSheet } from '@/features/practices/components/ReadingSettingsSheet'
import { useProgressiveCount } from '@/hooks/useProgressiveCount'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { useStableToday, useToday } from '@/hooks/useToday'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { usePractice } from './hooks/usePractice'
import type { usePracticeCompletion } from './hooks/usePracticeCompletion'
import type { PracticeContent } from './hooks/usePracticeContent'
import { derivePracticeFlowStatus } from './status'

type CompletionApi = ReturnType<typeof usePracticeCompletion>

type Props = {
  practiceId: string
  programDayProp: number | undefined
  contentQuery: UseQueryResult<PracticeContent>
  completion: CompletionApi
  thresholdElapsed: boolean
  onSelectOverride: (overrideKey: string, nextId: string) => void
}

export function PracticeFlowView({
  practiceId,
  programDayProp,
  contentQuery,
  completion,
  thresholdElapsed,
  onSelectOverride,
}: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const { manifest, flow, flowQuery, programDay } = usePractice(practiceId, programDayProp)

  const status = derivePracticeFlowStatus({
    manifest,
    flow,
    flowQuery,
    contentQuery,
    thresholdElapsed,
  })

  switch (status.kind) {
    case 'network-loading':
      return <Threshold word={t('practice.threshold')} subtitle={t('practice.loadingContent')} />
    case 'missing':
      return <PracticeMissing onBack={() => router.back()} />
    case 'content-error':
      return <PracticeContentError onRetry={() => contentQuery.refetch()} />
    case 'preparing':
      // External fetches (Compendium → vatican.va, Bible chapters → bolls.life)
      // can run for several seconds; surface that with the same subtitle the
      // network-loading state uses so the user knows we're not just stuck.
      return <Threshold word={t('practice.threshold')} subtitle={t('practice.loadingContent')} />
    case 'ready':
      // derivePracticeFlowStatus guarantees manifest is defined here.
      if (!manifest) return null
      return (
        <PracticeReady
          manifest={manifest}
          practiceId={practiceId}
          programDay={programDay}
          sections={contentQuery.data?.primitives ?? []}
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
  sections,
  completion,
  onSelectOverride,
}: {
  manifest: PracticeManifest
  practiceId: string
  programDay: number | undefined
  sections: PracticeContent['primitives']
  completion: CompletionApi
  onSelectOverride: (overrideKey: string, nextId: string) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const now = useToday()
  const realToday = useStableToday()
  const isFutureDate = now.getTime() > realToday.getTime()
  const readingMargin = useReadingMargin()
  const practiceName = localizeContent(manifest.name)
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Mount the primitive tree in chunks: long practices (Mass, offices) render
  // hundreds of blocks, and mounting them all at once blocks the JS thread
  // through the whole navigation. Keyed by array identity so a language or
  // translation switch restarts the chunking.
  const visibleCount = useProgressiveCount(sections.length, sections)

  // Runtime for lazily preprocessing a select branch the user switches to.
  const queryClient = useQueryClient()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const translation = usePreferencesStore((s) => s.translation)
  const preprocessCtx = useMemo(
    () => ({
      queryClient,
      prefs: { lang: contentLanguage, translation },
      date: now,
      programDay,
    }),
    [queryClient, contentLanguage, translation, now, programDay],
  )

  return (
    <PreprocessProvider value={preprocessCtx}>
      <ImageViewerProvider>
        <YStack flex={1}>
          <ScreenLayout>
            <YStack gap="$lg" paddingVertical="$lg">
              <ManuscriptFrame>
                <YStack alignItems="center" gap="$xs" paddingVertical="$md">
                  <Typography variant="ceremonial" fontSize="$5">
                    ✠
                  </Typography>
                  <Typography variant="screen-title" fontSize="$5">
                    {practiceName}
                  </Typography>
                  <Typography variant="label" tone="muted" fontSize="$2" letterSpacing={1}>
                    {formattedDate}
                  </Typography>
                </YStack>
              </ManuscriptFrame>

              <YStack gap="$md" paddingHorizontal={readingMargin} paddingTop="$xxl">
                {sections.slice(0, visibleCount).map((primitive, index) => (
                  <PrimitiveBlock
                    key={`${primitive.type}-${index}`}
                    primitive={primitive}
                    practiceId={practiceId}
                    onSelectOverride={onSelectOverride}
                  />
                ))}
              </YStack>

              {manifest.completion !== 'manual' && !isFutureDate && (
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

          {/* The native tab bar is hidden on this screen (see (tabs)/_layout). These
            two Liquid Glass buttons replace it: back on the left, reading &
            language settings on the right. */}
          <GlassIconButton
            onPress={() => {
              lightTap()
              router.back()
            }}
            accessibilityLabel={t('common.back')}
            style={{ position: 'absolute', bottom: insets.bottom + 12, left: 16, zIndex: 10 }}
          >
            <ChevronLeft size={22} color={theme.color.val} />
          </GlassIconButton>

          <GlassIconButton
            onPress={() => {
              lightTap()
              setSettingsOpen(true)
            }}
            accessibilityLabel={t('readingConfig.reading')}
            style={{ position: 'absolute', bottom: insets.bottom + 12, right: 16, zIndex: 10 }}
          >
            <Type size={20} color={theme.color.val} />
          </GlassIconButton>

          <ReadingSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </YStack>
      </ImageViewerProvider>
    </PreprocessProvider>
  )
}

const glassButtonStyle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
} as const

// Subtle drop shadow so the floating button reads against varied prayer content.
const glassShadowStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const

// A floating circular Liquid Glass button. Plain Pressable (not AnimatedPressable)
// because animating opacity on a glass surface or its parent kills the effect;
// GlassSurface's own `isInteractive` provides the native press highlight. No color
// tint (kept clean) — the soft shadow gives the glass a defined edge so it reads
// over the prayer text.
function GlassIconButton({
  onPress,
  accessibilityLabel,
  style,
  children,
}: {
  onPress: () => void
  accessibilityLabel: string
  style: StyleProp<ViewStyle>
  children: ReactNode
}) {
  const isDark = useThemeName().startsWith('dark')
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[style, glassShadowStyle]}
    >
      <GlassSurface isDark={isDark} style={glassButtonStyle}>
        {children}
      </GlassSurface>
    </Pressable>
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
