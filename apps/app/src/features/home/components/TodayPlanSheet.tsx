import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import type { TodayPlan } from '../useTodayPlan'
import { TodayChecklist } from './TodayChecklist'

const sheet = createSheet()

export const openTodayPlan = sheet.open

/** The day's plan of life, drawn up over Today from the Plan of Life card. */
export function TodayPlanSheet({ plan }: { plan: TodayPlan }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <NativeSheet sheet={sheet}>
      {({ expanded, height, bodyShown }) => (
        <YStack paddingTop="$xl" gap="$md" height={height}>
          <Typography variant="screen-title" fontSize="$5" paddingHorizontal="$lg">
            {t('home.planOfLife')}
          </Typography>
          {/* Part-way up, a drag moves the sheet rather than the list: the
              native sheet can't hand an RN scroll over to itself, so the list
              only scrolls once the sheet is at the top. */}
          <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={expanded}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48}>
              {bodyShown && <TodayChecklist plan={plan} onLeave={sheet.close} />}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}
