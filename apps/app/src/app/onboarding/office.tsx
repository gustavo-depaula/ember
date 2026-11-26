import { useRouter } from 'expo-router'

import { ScreenLayout } from '@/components'
import { OfficeAsk } from '@/features/onboarding'

export default function OnboardingOffice() {
  const router = useRouter()
  return (
    <ScreenLayout modal>
      <OfficeAsk
        onBack={() => router.back()}
        onRegular={() => router.push('/onboarding/office-hours')}
        onNew={() => router.push('/onboarding/office-first')}
      />
    </ScreenLayout>
  )
}
