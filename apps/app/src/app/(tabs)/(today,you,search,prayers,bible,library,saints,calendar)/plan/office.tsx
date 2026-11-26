import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ScreenLayout } from '@/components'
import { OfficeChooser } from '@/features/plan-of-life/components/OfficeChooser'

/**
 * The Divine Office's book and hours, opened from its row on the plan sheet,
 * or from the Office question, which saving closes with it: the two are the
 * plan stack's own.
 */
export default function OfficeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  const { from } = useLocalSearchParams<{ from?: string }>()
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('plan.officeTitle') }} />
      <OfficeChooser
        title={t('plan.officeTitle')}
        onBack={() => router.back()}
        onSaved={() => (from === 'ask' ? navigation.getParent()?.goBack() : router.back())}
      />
    </ScreenLayout>
  )
}
