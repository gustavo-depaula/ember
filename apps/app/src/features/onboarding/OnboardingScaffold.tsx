import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Theme, YStack } from 'tamagui'

import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'

import { PrimaryButton, SkipButton } from './OnboardingButtons'
import { OnboardingProgress } from './OnboardingProgress'

/**
 * The vigil ground. Onboarding runs in Tenebrae regardless of the user's theme
 * preference — it picks up where the boot splash leaves off (the same cathedral
 * void) and only opens into day at the end, when the tabs are revealed. Every
 * onboarding surface renders inside this so no seam flashes parchment.
 */
export function VigilShell({ children }: { children: ReactNode }) {
  return <Theme name="dark">{children}</Theme>
}

/**
 * Shared chrome for the onboarding input steps: progress dots, the app-wide
 * masthead (a gold tracked-caps marker over an italic screen title), a
 * scrollable body, and a footer. The intro and done screens render their own
 * full-bleed layout instead.
 */
export function OnboardingScaffold({
  marker,
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
  marker?: string
  title: string
  subtitle?: string
  progress?: { index: number; total: number }
  children: ReactNode
  /** Omit to render a step with no primary CTA — the body itself is the action. */
  continueLabel?: string
  onContinue?: () => void
  continueDisabled?: boolean
  onSkip: () => void
  skipLabel?: string
}) {
  const { t } = useTranslation()

  return (
    <VigilShell>
      <ScreenLayout scroll={false} modal>
        <YStack flex={1} paddingVertical="$lg" gap="$lg">
          {progress ? <OnboardingProgress index={progress.index} total={progress.total} /> : null}

          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {/* Clears the pinned footer so the last row isn't sliced by it. */}
            <YStack gap="$lg" paddingBottom="$xl">
              <YStack gap="$xs">
                {marker ? (
                  <Typography
                    variant="label"
                    color="$accent"
                    textTransform="uppercase"
                    letterSpacing={1.5}
                    fontSize="$1"
                  >
                    {marker}
                  </Typography>
                ) : null}
                <Typography variant="screen-title" fontSize={40} lineHeight={48}>
                  {title}
                </Typography>
                {subtitle ? <Typography variant="whisper">{subtitle}</Typography> : null}
              </YStack>
              {children}
            </YStack>
          </ScrollView>

          <YStack gap="$sm">
            {onContinue ? (
              <PrimaryButton
                label={continueLabel ?? t('common.continue')}
                onPress={onContinue}
                disabled={continueDisabled}
              />
            ) : null}
            <SkipButton label={skipLabel} onPress={onSkip} />
          </YStack>
        </YStack>
      </ScreenLayout>
    </VigilShell>
  )
}
