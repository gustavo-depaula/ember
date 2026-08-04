import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { CandleFlame } from '@/components/CandleFlame'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { completeOnboarding, PrimaryButton, VigilShell } from '@/features/onboarding'

/**
 * The closing screen: a lit candle in the dark, then the vigil opens into the
 * day. `Begin` flips `hasOnboarded`, and the root guard reveals the tabs.
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
            <CandleFlame size={72} />
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
          />
        </YStack>
      </ScreenLayout>
    </VigilShell>
  )
}
