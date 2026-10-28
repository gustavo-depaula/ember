import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import type { TodayPlan } from '../useTodayPlan'
import { AlsoPrayed } from './AlsoPrayed'
import { ObligationNotice } from './ObligationCard'
import { TodayChecklist } from './TodayChecklist'

const stay = () => {}

/**
 * The day's plan of life set into the page: on a wide window it stands beside
 * Today instead of waiting in the sheet behind the Plan of Life card.
 */
export function TodayPlanPanel({ plan }: { plan: TodayPlan }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$md">
      <Typography variant="marker" textAlign="left" fontSize={12}>
        {t('home.planOfLife')}
      </Typography>
      <ObligationNotice date={plan.now} />
      <YStack>
        <TodayChecklist plan={plan} onLeave={stay} />
        <AlsoPrayed plan={plan} onLeave={stay} />
      </YStack>
    </YStack>
  )
}
