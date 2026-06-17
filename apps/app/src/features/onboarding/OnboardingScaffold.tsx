import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { PageHeader } from '@/components/PageHeader'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'

import { OnboardingProgress } from './OnboardingProgress'

/**
 * Shared chrome for the onboarding input steps: progress dots, a left-aligned
 * title + optional subtitle, a scrollable content area, and a fixed footer with
 * a primary Continue and a quiet Skip. The intro and done screens render their
 * own full-bleed layout instead.
 */
export function OnboardingScaffold({
  title,
  subtitle,
  progress,
  children,
  continueLabel,
  onContinue,
  continueDisabled,
  onSkip,
  skipLabel,
}: {
  title: string
  subtitle?: string
  progress?: { index: number; total: number }
  children: ReactNode
  continueLabel?: string
  onContinue: () => void
  continueDisabled?: boolean
  onSkip: () => void
  skipLabel?: string
}) {
  const { t } = useTranslation()

  return (
    <ScreenLayout scroll={false} modal>
      <YStack flex={1} paddingVertical="$lg" gap="$lg">
        {progress ? <OnboardingProgress index={progress.index} total={progress.total} /> : null}

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack gap="$lg" paddingBottom="$lg">
            <YStack gap="$sm">
              <PageHeader title={title} />
              {subtitle ? <Typography variant="whisper">{subtitle}</Typography> : null}
            </YStack>
            {children}
          </YStack>
        </ScrollView>

        <YStack gap="$sm">
          <AnimatedPressable
            onPress={continueDisabled ? undefined : onContinue}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!continueDisabled }}
            accessibilityLabel={continueLabel ?? t('common.continue')}
          >
            <YStack
              backgroundColor="$accent"
              borderRadius="$md"
              padding="$md"
              alignItems="center"
              opacity={continueDisabled ? 0.45 : 1}
            >
              <Typography variant="label" fontSize="$3" color="$background">
                {continueLabel ?? t('common.continue')}
              </Typography>
            </YStack>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={skipLabel ?? t('common.skip')}
          >
            <YStack padding="$sm" alignItems="center">
              <Typography variant="whisper">{skipLabel ?? t('common.skip')}</Typography>
            </YStack>
          </AnimatedPressable>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
