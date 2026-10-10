import { useTranslation } from 'react-i18next'
import { View, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FadeInView,
  PageBreakOrnament,
  ScreenLayout,
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
  TodayPlanPanel,
  TodayPlanSheet,
  TodayRow,
  useTodayPlan,
} from '@/features/home'
import { ContinueRow } from '@/features/library'
import { MissedDaysSheet } from '@/features/plan-of-life'
import { usePlanFidelity } from '@/features/plan-of-life/useRuleRecord'
import { usePreferencesStore } from '@/stores/preferencesStore'

const fidelityWeeks = 10

import { useRollStandingPrograms } from '@/features/plan-of-life'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

export default function HomeScreen() {
  const { t } = useTranslation()
  const plan = useTodayPlan()
  useRollStandingPrograms(useOfTransfers())
  const { now, anchorDate, season, todaySlots, completedIds, onPressItem } = plan
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const prayNow = usePrayNow({ slots: todaySlots, completedIds, onPray: onPressItem })

  const fidelity = usePlanFidelity(fidelityWeeks)

  const totalSlots = todaySlots.length
  const completedCount = todaySlots.filter((s) => completedIds.has(s.id)).length
  // With room for a second column the day's plan stands on the page, as the
  // liturgy of the day does beside the website's home.
  const { expanded } = useWidthClass()

  const header = (
    <LiturgicalHeader
      date={now}
      season={season}
      today={anchorDate}
      onSelectDate={(date) => setTimeTravelEphemeral(date === anchorDate ? undefined : date)}
    />
  )
  const shelves = (
    <YStack gap="$lg">
      <FadeInView>
        <ExploreFeatured leading={prayNow && <PrayNowCard {...prayNow} />} />
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
                asideWidth={340}
                gap={28}
                aside={
                  // Ruled off from the day's shelves, as the website's column is.
                  <YStack
                    gap="$lg"
                    paddingLeft={28}
                    borderLeftWidth={0.5}
                    borderLeftColor="$borderColor"
                  >
                    <TodayPlanPanel plan={plan} />
                    {fidelityWall}
                  </YStack>
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

          <PageBreakOrnament />

          <Aspiratio date={now} />
        </YStack>
      </ScreenLayout>
      <TodayPlanSheet plan={plan} />
      <FidelitySheet fidelity={fidelity} weeks={fidelityWeeks} />
      <MissedDaysSheet />
    </View>
  )
}
