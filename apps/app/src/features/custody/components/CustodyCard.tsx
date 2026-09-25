import { useRouter } from 'expo-router'
import { Shield } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'tamagui'

import { PlanCard } from '@/features/plan-of-life'

import { custodyHref } from '../routes'

/** Custody's doorway card, under the votive wall on the You tab. */
export function CustodyCard() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  return (
    <PlanCard
      icon={<Shield size={28} color={theme.accent?.val} />}
      label={t('custody.title')}
      subtitle={t('you.custodyHint')}
      onPress={() => router.push(custodyHref)}
    />
  )
}
