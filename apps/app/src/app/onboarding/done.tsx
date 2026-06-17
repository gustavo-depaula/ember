import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { completeOnboarding, PrimaryButton } from '@/features/onboarding'

export default function OnboardingDoneScreen() {
  const { t } = useTranslation()

  return (
    <ScreenLayout scroll={false} modal>
      <YStack flex={1} paddingVertical="$lg" gap="$lg">
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$lg"
          paddingHorizontal="$md"
        >
          <Typography variant="ceremonial" fontSize={64} lineHeight={72}>
            ✠
          </Typography>
          <Typography variant="sacred-title" fontSize={30} textAlign="center">
            {t('onboarding.done.title')}
          </Typography>
          <Typography variant="whisper" textAlign="center" fontSize="$3" maxWidth={360}>
            {t('onboarding.done.body')}
          </Typography>
        </YStack>

        <PrimaryButton label={t('onboarding.done.begin')} onPress={completeOnboarding} />
      </YStack>
    </ScreenLayout>
  )
}
