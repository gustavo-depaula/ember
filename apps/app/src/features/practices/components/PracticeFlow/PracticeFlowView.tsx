// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import type { UseQueryResult } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Type } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, YStack } from 'tamagui'
import {
  AnimatedPressable,
  ManuscriptFrame,
  PrimitiveBlock,
  ScreenLayout,
  Threshold,
  Typography,
} from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import type { PracticeManifest } from '@/content/manifestTypes'
import { ProgramCompleteModal } from '@/features/practices/components/ProgramCompleteModal'
import { ReadingSettingsSheet } from '@/features/practices/components/ReadingSettingsSheet'
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { useToday } from '@/hooks/useToday'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'
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
  const { manifest, flow, flowQuery } = usePractice(practiceId, programDayProp)

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
  sections,
  completion,
  onSelectOverride,
}: {
  manifest: PracticeManifest
  practiceId: string
  sections: PracticeContent['primitives']
  completion: CompletionApi
  onSelectOverride: (overrideKey: string, nextId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const now = useToday()
  const readingMargin = useReadingMargin()
  const practiceName = localizeContent(manifest.name)
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
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
              {sections.map((primitive, index) => (
                <PrimitiveBlock
                  key={`${primitive.type}-${index}`}
                  primitive={primitive}
                  practiceId={practiceId}
                  onSelectOverride={onSelectOverride}
                />
              ))}
            </YStack>

            {manifest.completion !== 'manual' && (
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

        {/* Reading & language settings — pinned outside the scroll so it stays put. */}
        <AnimatedPressable
          onPress={() => {
            lightTap()
            setSettingsOpen(true)
          }}
          accessibilityRole="button"
          accessibilityLabel={t('readingConfig.reading')}
          style={{ position: 'absolute', top: insets.top + 4, right: 12, zIndex: 10 }}
        >
          <View
            width={36}
            height={36}
            borderRadius={18}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$backgroundSurface"
          >
            <Type size={18} color={theme.accent.val} />
          </View>
        </AnimatedPressable>

        <ReadingSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </YStack>
    </ImageViewerProvider>
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
