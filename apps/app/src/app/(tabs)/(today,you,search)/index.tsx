import { useTranslation } from 'react-i18next'
import { View, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FadeInView,
  ObligationBadges,
  PageBreakOrnament,
  ScreenLayout,
  Typography,
  VotiveWall,
} from '@/components'
import { DailyMeditations, ExploreFeatured, PrayNowCard, usePrayNow } from '@/features/explore'
import {
  Aspiratio,
  FidelitySheet,
  LiturgicalHeader,
  openFidelity,
  TodayPlanSheet,
  TodayRow,
  useTodayPlan,
} from '@/features/home'
import { ContinueRow } from '@/features/library'
import { MissedDaysSheet } from '@/features/plan-of-life'
import { usePlanFidelity } from '@/features/plan-of-life/useRuleRecord'
import { useObligations } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

const fidelityWeeks = 10

export default function HomeScreen() {
  const { t } = useTranslation()
  const plan = useTodayPlan()
  const { now, anchorDate, season, todaySlots, completedIds, onPressItem } = plan
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const prayNow = usePrayNow({ slots: todaySlots, completedIds, onPray: onPressItem })

  const fidelity = usePlanFidelity(fidelityWeeks)
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

          {todaySlots.length > 0 && (
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
