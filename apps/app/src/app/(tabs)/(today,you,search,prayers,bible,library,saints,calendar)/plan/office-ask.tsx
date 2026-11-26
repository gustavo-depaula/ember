import { Stack, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { ScreenLayout } from '@/components'
import { OfficeAsk } from '@/features/onboarding'

/** Onboarding's Office question, asked again by an empty plan's Office row. */
export default function OfficeAskScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('onboarding.office.ask') }} />
      <OfficeAsk
        onBack={() => router.back()}
        // Saving there closes the question with it.
        onRegular={() => router.push({ pathname: '/plan/office', params: { from: 'ask' } })}
        onNew={() => router.push('/plan/office-first')}
      />
    </ScreenLayout>
  )
}
