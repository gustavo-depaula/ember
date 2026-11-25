import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { artFor } from '@/features/explore/artMap'
import { ChoiceRow } from '@/features/onboarding'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'

/** Whether the Office is already prayed: the regular keeps their own, the new start with one hour. */
export default function OnboardingOffice() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <ScreenLayout modal>
      <YStack paddingVertical="$lg" gap="$lg">
        <PracticeHeader
          onBack={() => router.back()}
          name={t('onboarding.office.ask')}
          caption={t('onboarding.office.kicker')}
        />
        <YStack>
          <ChoiceRow
            testID="onboarding-office-regular"
            first
            title={t('onboarding.office.regular')}
            hint={t('onboarding.office.regularHint')}
            image={artFor('practice/patristic-reading')}
            onPress={() => router.push('/onboarding/office-hours')}
          />
          <ChoiceRow
            testID="onboarding-office-new"
            title={t('onboarding.office.new')}
            hint={t('onboarding.office.newHint')}
            image={artFor('practice/opus-dei-meditation')}
            onPress={() => router.push('/onboarding/office-first')}
          />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
