import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { RuleGuide } from '@/features/plan-of-life/components/RuleGuide'

export default function AddToRuleScreen() {
  const { t } = useTranslation()
  return (
    <>
      <Stack.Screen options={{ title: t('ruleGuide.title') }} />
      <RuleGuide />
    </>
  )
}
