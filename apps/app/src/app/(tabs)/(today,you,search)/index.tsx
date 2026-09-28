import { format, subWeeks } from 'date-fns'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, YStack } from 'tamagui'

import {
  FadeInView,
  ObligationBadges,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
  Typography,
  VotiveWall,
} from '@/components'
import {
  DailyMeditations,
  ExploreFeatured,
  FromOpusDei,
  FromRome,
  PrayNowCard,
  usePrayNow,
} from '@/features/explore'
import {
  Aspiratio,
  LiturgicalHeader,
  MementoLine,
  TodayPlanSheet,
  TodayRow,
  useTodayPlan,
} from '@/features/home'
import { ContinueRow } from '@/features/library'
import { buildTieredWallData, useCompletionRange } from '@/features/plan-of-life'
import { useObligations } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export default function HomeScreen() {
  const { t } = useTranslation()
  const plan = useTodayPlan()
  const { now, anchorDate, season, slots, todaySlots, completedIds, selectedDate, onPressItem } =
    plan
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const prayNow = usePrayNow({ slots: todaySlots, completedIds, onPray: onPressItem })

  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const wallLogs = useCompletionRange(wallStart, selectedDate)
  const wallData = useMemo(() => buildTieredWallData(wallLogs, slots), [wallLogs, slots])
  const obligations = useObligations(now)

  const totalSlots = todaySlots.length
  const completedCount = todaySlots.filter((s) => completedIds.has(s.id)).length

  return (
    <View flex={1}>
      <ScreenLayout>
        <YStack gap="$lg" paddingBottom="$lg">
          <YStack gap="$md">
            <LiturgicalHeader
              date={now}
              season={season}
              today={anchorDate}
              onSelectDate={(date) =>
                setTimeTravelEphemeral(date === anchorDate ? undefined : date)
              }
            />

            <FadeInView>
              <ExploreFeatured leading={prayNow && <PrayNowCard {...prayNow} />} />
            </FadeInView>
          </YStack>

          <FadeInView index={1}>
            <TodayRow plan={plan} />
          </FadeInView>

          {obligations && (obligations.fast || obligations.abstinence !== 'none') && (
            <FadeInView index={1}>
              <ObligationBadges fast={obligations.fast} abstinence={obligations.abstinence} />
            </FadeInView>
          )}

          <ContinueRow />

          <DailyMeditations />

          <PageBreakOrnament />

          <Aspiratio date={now} />

          <MementoLine />

          {todaySlots.length > 0 && (
            <>
              <SectionDivider />
              <FadeInView index={3}>
                <YStack alignItems="center" gap="$sm">
                  <Typography variant="label" fontSize="$2">
                    {t('home.fidelity')}
                  </Typography>
                  <VotiveWall data={wallData} weeks={10} tiered />
                  {completedCount === totalSlots && (
                    <Typography variant="sacred-title" fontSize="$3" color="$accent">
                      Pax Christi.
                    </Typography>
                  )}
                  <Typography tone="muted" fontSize="$1">
                    {t('home.todayProgress', {
                      completed: completedCount,
                      total: totalSlots,
                    })}
                  </Typography>
                </YStack>
              </FadeInView>
            </>
          )}

          <FromRome />

          <FromOpusDei />
        </YStack>
      </ScreenLayout>
      <TodayPlanSheet plan={plan} />
    </View>
  )
}
