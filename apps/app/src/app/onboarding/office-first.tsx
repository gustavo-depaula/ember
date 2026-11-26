import { useRouter } from 'expo-router'

import { ScreenLayout } from '@/components'
import { OfficeFirst, OtherPrayerLine } from '@/features/onboarding'

export default function OnboardingOfficeFirst() {
  const router = useRouter()
  return (
    <ScreenLayout modal>
      <OfficeFirst
        onBack={() => router.back()}
        onAdded={() => router.push('/onboarding/reminders')}
      >
        <OtherPrayerLine />
      </OfficeFirst>
    </ScreenLayout>
  )
}
