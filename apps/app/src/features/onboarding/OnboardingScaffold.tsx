import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, YStack } from 'tamagui'

import { PageHeader } from '@/components/PageHeader'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { PrimaryButton, SkipButton } from './OnboardingButtons'
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
          <PrimaryButton
            label={continueLabel ?? t('common.continue')}
            onPress={onContinue}
            disabled={continueDisabled}
          />
          <SkipButton label={skipLabel} onPress={onSkip} />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
