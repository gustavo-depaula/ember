import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { completeOnboarding, PrimaryButton, VigilShell } from '@/features/onboarding'

/**
 * The closing screen: a gold cross in the dark, then the vigil opens into the
 * day. This is the one place the CTA fills — gold spent on the single moment
 * that matters. `Begin` flips `hasOnboarded`, and the root guard reveals the tabs.
 */
export default function OnboardingDoneScreen() {
  const { t } = useTranslation()

  return (
    <VigilShell>
      <ScreenLayout scroll={false} modal>
        <YStack flex={1} paddingVertical="$lg" gap="$lg">
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap="$lg"
            paddingHorizontal="$md"
          >
            {/* The flow's one ceremonial peak. `CandleFlame` was tried here and
                reads as clip-art at rest — flat lozenges in an orange that isn't
                in the palette. */}
            <Typography variant="ceremonial" fontSize={56} lineHeight={64}>
              ✠
            </Typography>
            <Typography variant="screen-title" fontSize={38} lineHeight={46} textAlign="center">
              {t('onboarding.done.title')}
            </Typography>
            <Typography variant="whisper" textAlign="center" fontSize="$3" maxWidth={360}>
              {t('onboarding.done.body')}
            </Typography>
          </YStack>

          <PrimaryButton
            label={t('onboarding.done.begin')}
            onPress={completeOnboarding}
            haptic="success"
            filled
          />
        </YStack>
      </ScreenLayout>
    </VigilShell>
  )
}
