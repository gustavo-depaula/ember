import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { completeOnboarding } from '@/features/onboarding'

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

        <AnimatedPressable
          onPress={completeOnboarding}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.done.begin')}
        >
          <YStack backgroundColor="$accent" borderRadius="$md" padding="$md" alignItems="center">
            <Typography variant="label" fontSize="$3" color="$background">
              {t('onboarding.done.begin')}
            </Typography>
          </YStack>
        </AnimatedPressable>
      </YStack>
    </ScreenLayout>
  )
}
