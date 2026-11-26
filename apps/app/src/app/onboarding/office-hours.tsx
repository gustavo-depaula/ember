import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ScreenLayout } from '@/components'
import { OtherPrayerLine } from '@/features/onboarding'
import { OfficeChooser } from '@/features/plan-of-life/components/OfficeChooser'

/** For one who prays the Office: which book, then which of its hours make the plan. */
export default function OnboardingOfficeHours() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <ScreenLayout modal>
      <OfficeChooser
        title={t('onboarding.office.which')}
        onBack={() => router.back()}
        onSaved={() => router.push('/onboarding/reminders')}
      >
        <OtherPrayerLine />
      </OfficeChooser>
    </ScreenLayout>
  )
}
