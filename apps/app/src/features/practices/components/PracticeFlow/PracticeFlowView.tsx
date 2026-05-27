// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer sections never reorder

import type { UseQueryResult } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'
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
import { useReadingMargin } from '@/hooks/useReadingStyle'
import { useToday } from '@/hooks/useToday'
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
  const now = useToday()
  const readingMargin = useReadingMargin()
  const practiceName = localizeContent(manifest.name)
  const formattedDate = formatLocalized(now, 'EEEE, MMMM d, yyyy')

  return (
    <ImageViewerProvider>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <ManuscriptFrame>
            <YStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$md"
              paddingHorizontal={readingMargin}
            >
              {manifest.theme !== 'office' && (
                <Typography variant="ceremonial" fontSize="$5">
                  ✠
                </Typography>
              )}
              <Typography variant="sacred-title" fontSize="$5" color="$colorBurgundy">
                {practiceName}
              </Typography>
              <Typography tone="muted" fontSize="$2" letterSpacing={1}>
                {formattedDate}
              </Typography>
            </YStack>

            <YStack gap="$md">
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
          </ManuscriptFrame>
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
