import { Stack, useNavigation, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ScreenLayout } from '@/components'
import { OfficeFirst } from '@/features/onboarding'

/** A first hour of the Office for one new to it, reached from the Office question. */
export default function OfficeFirstScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const navigation = useNavigation()
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('onboarding.office.introTitle') }} />
      <OfficeFirst
        onBack={() => router.back()}
        // The question and this page are the plan stack's own: closing it returns to the plan.
        onAdded={() => navigation.getParent()?.goBack()}
      />
    </ScreenLayout>
  )
}
