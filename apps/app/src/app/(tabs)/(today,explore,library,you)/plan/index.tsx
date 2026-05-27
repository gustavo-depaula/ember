import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { RuleOfLifeSections } from '@/features/plan-of-life'

export default function PlanScreen() {
  const { t } = useTranslation()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('plan.title')} />
        <RuleOfLifeSections />
      </YStack>
    </ScreenLayout>
  )
}
