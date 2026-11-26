import { Stack, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ScreenLayout } from '@/components'
import { OfficeChooser } from '@/features/plan-of-life/components/OfficeChooser'

/** The Divine Office's book and hours, opened from its row on the plan sheet. */
export default function OfficeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('plan.officeTitle') }} />
      <OfficeChooser
        title={t('plan.officeTitle')}
        onBack={() => router.back()}
        onSaved={() => router.back()}
      />
    </ScreenLayout>
  )
}
