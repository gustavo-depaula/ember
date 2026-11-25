import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FadeInView,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
  Split,
  Typography,
  useWidthClass,
  VotiveWall,
} from '@/components'
import { DailyMeditations, ExploreFeatured, PrayNowCard, usePrayNow } from '@/features/explore'
import {
  Aspiratio,
  EventsRow,
  FidelitySheet,
  LiturgicalHeader,
  openFidelity,
  TodayLiturgyPanel,
  TodayPlanPanel,
  TodayPlanSheet,
  TodayRow,
  useTodayPlan,
} from '@/features/home'
import { ContinueRow } from '@/features/library'
import { MissedDaysSheet } from '@/features/plan-of-life'
import { usePlanFidelity } from '@/features/plan-of-life/useRuleRecord'
import { ViewedDayContext } from '@/hooks/useToday'

const fidelityWeeks = 10

import { useRollStandingPrograms } from '@/features/plan-of-life'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

/**
 * Today, on the day its date scrubber has moved to: the day is Today's own,
 * provided to its tree alone, so a look at another day changes what Today
 * shows and nothing the rest of the app records.
 */
export default function HomeScreen() {
  const [viewed, setViewed] = useState<string>()
  return (
    <ViewedDayContext.Provider value={viewed}>
      <HomePage onSelectDate={setViewed} />
    </ViewedDayContext.Provider>
  )
}

function HomePage({ onSelectDate }: { onSelectDate: (date: string | undefined) => void }) {
  const { t } = useTranslation()
  const plan = useTodayPlan()
  useRollStandingPrograms(useOfTransfers())
  const { now, anchorDate, season, todaySlots, completedIds, onPressItem } = plan
  const prayNow = usePrayNow({ slots: todaySlots, completedIds, onPray: onPressItem })
  // Pray Now reads the clock, which only today's plan keeps.
  const onToday = plan.selectedDate === anchorDate

  const fidelity = usePlanFidelity(fidelityWeeks)

  const totalSlots = todaySlots.length
  const completedCount = todaySlots.filter((s) => completedIds.has(s.id)).length
  // With room for a second column the day's plan stands on the page, as the
  // liturgy of the day does beside the website's home.
  const { medium, expanded } = useWidthClass()

  const header = (
    <LiturgicalHeader
      date={now}
      season={season}
      today={anchorDate}
      onSelectDate={(date) => onSelectDate(date === anchorDate ? undefined : date)}
    />
  )
  const shelves = (
    <YStack gap="$lg">
      <FadeInView>
        <ExploreFeatured leading={prayNow && onToday && <PrayNowCard {...prayNow} />} />
      </FadeInView>

      <FadeInView index={1}>
        <TodayRow plan={plan} showPlan={!expanded} />
      </FadeInView>

      <ContinueRow />

      <DailyMeditations />

      <EventsRow />
    </YStack>
  )
  const fidelityWall = todaySlots.length > 0 && (
    <FadeInView index={3}>
      <AnimatedPressable
        onPress={openFidelity}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.openFidelity')}
      >
        <YStack alignItems="center" gap="$sm" paddingTop="$lg">
          <Typography variant="label" fontSize="$2">
            {t('home.fidelity')}
          </Typography>
          <VotiveWall data={fidelity?.wall ?? []} weeks={fidelityWeeks} fidelity />
          {completedCount === totalSlots && (
            <Typography variant="sacred-title" fontSize="$3" color="$accent">
              Pax Christi.
            </Typography>
          )}
          {fidelity && fidelity.prayedDays > 0 && (
            <YStack alignItems="center">
              {fidelity.streak > 1 && (
                <Typography tone="muted" fontSize="$1">
                  {t('home.streakDays', { count: fidelity.streak })}
                </Typography>
              )}
              <Typography tone="muted" fontSize="$1">
                {t('home.prayedDays', {
                  prayed: fidelity.prayedDays,
                  count: fidelity.countedDays,
                })}
              </Typography>
            </YStack>
          )}
        </YStack>
      </AnimatedPressable>
    </FadeInView>
  )

  return (
    <View flex={1}>
      <ScreenLayout measure="wide">
        <YStack gap="$lg" paddingBottom="$lg">
          {expanded ? (
            <>
              {header}
              <Split
                asideSide="right"
                asideWidth={368}
                gap={28}
                ruled
                aside={
                  <>
                    <TodayPlanPanel plan={plan} />
                    <TodayLiturgyPanel date={now} />
                    {fidelityWall}
                  </>
                }
              >
                {shelves}
              </Split>
            </>
          ) : (
            <>
              <YStack gap="$md">{header}</YStack>
              {shelves}
              {fidelityWall}
            </>
          )}

          {medium ? <SectionDivider /> : <PageBreakOrnament />}

          <Aspiratio date={now} />
        </YStack>
      </ScreenLayout>
      <TodayPlanSheet plan={plan} />
      <FidelitySheet fidelity={fidelity} weeks={fidelityWeeks} />
      <MissedDaysSheet />
    </View>
  )
}
