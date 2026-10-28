import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text as RNText, StyleSheet, View } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { CoverKicker, OrdoSheet } from '@/features/covers'
import { coverFonts, coverInk } from '@/features/covers/parts'
import { type BlockTone, jewelTones } from '@/features/explore/bgColor'
import {
  dayMinutes,
  getActiveBlocks,
  getCurrentTimeBlock,
  getSlotName,
  getSlotPinLabel,
} from '@/features/plan-of-life'
import { useMinuteOfDay } from '@/hooks/useCurrentHour'
import {
  type DayStanding,
  entriesAround,
  owedAt,
  type PlanEntry,
  planStanding,
} from '../planStanding'
import type { TodayPlan } from '../useTodayPlan'

export const planCardSize = 160
const pad = planCardSize * 0.09
const shownEntries = 5

// The heading band is the day's light: green on track, gold once an essential
// practice has waited well past its time, red once one is at risk of being
// missed. A day with nothing to pray — no plan, or a plan that leaves the day
// empty — takes the red too, to be noticed.
const bandTone: Record<DayStanding, BlockTone> = {
  done: jewelTones.green,
  ontrack: jewelTones.green,
  delayed: jewelTones.gold,
  atrisk: jewelTones.red,
}

/**
 * Today's plan of life as a page of the Ordo: the band carries the day's
 * standing and count, and beneath the title the practices around this time of
 * day — missed ones in rubric, prayed ones faded. With no plan yet the page
 * invites one instead.
 */
export function PlanOfLifeCard({
  plan: { slots, todaySlots, completedIds, pinnedFlows },
  onPress,
}: {
  plan: TodayPlan
  onPress: () => void
}) {
  const { t } = useTranslation()
  const now = useMinuteOfDay()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pinnedFlows re-derives pinned slots' names as their flows load
  const blocks = useMemo(
    () =>
      getActiveBlocks(todaySlots).map(({ block, def }) => ({
        block,
        slots: def.slots.map((s) => ({
          id: s.id,
          name: getSlotPinLabel(s) ?? getSlotName(s, t),
          essential: s.tier === 'essential',
          owed: owedAt(block, s.time),
        })),
      })),
    [todaySlots, t, pinnedFlows],
  )
  const { day, shown } = useMemo(() => {
    const day = planStanding(blocks, completedIds, dayMinutes(now))
    const current = getCurrentTimeBlock(Math.floor(now / 60))
    return { day, shown: entriesAround(day.entries, current, shownEntries) }
  }, [blocks, completedIds, now])
  const total = day.entries.length
  const noPlan = slots.length === 0
  const tone = total > 0 ? bandTone[day.standing] : jewelTones.red

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={noPlan ? t('home.planSetUp') : t('a11y.openTodayPlan')}
    >
      <YStack width={planCardSize} gap="$sm">
        <View style={[styles.shadow, { width: planCardSize, height: planCardSize }]}>
          <OrdoSheet tone={tone} s={planCardSize} />

          <View style={[styles.abs, styles.band]}>
            {total > 0 ? (
              <>
                <Kicker color={coverInk.cream}>
                  {t('home.planCount', { done: day.done, total }).toLocaleUpperCase()}
                </Kicker>
                <Kicker color={coverInk.gold}>
                  {t(`home.planStanding.${day.standing}`).toLocaleUpperCase()}
                </Kicker>
              </>
            ) : (
              <Kicker color={coverInk.cream}>
                {t(noPlan ? 'home.planToBegin' : 'home.planEmptyDay').toLocaleUpperCase()}
              </Kicker>
            )}
          </View>

          <View style={[styles.abs, styles.title]}>
            {/* Fixed size: CoverText's shrink-to-fit collapses it on device. */}
            <RNText allowFontScaling={false} numberOfLines={1} style={styles.titleText}>
              {t('home.planOfLife')}
            </RNText>
          </View>

          <View style={[styles.abs, styles.entries]}>
            {(() => {
              if (total === 0)
                return (
                  <>
                    <Note>{t(noPlan ? 'home.planInvite' : 'home.planNothingToday')}</Note>
                    <RNText
                      allowFontScaling={false}
                      style={[styles.entry, { color: coverInk.rubric }]}
                    >
                      {t(
                        noPlan ? 'home.planSetUpAction' : 'home.emptyPlanAction',
                      ).toLocaleUpperCase()}
                    </RNText>
                  </>
                )
              if (day.standing === 'done') return <Note>Pax Christi.</Note>
              return shown.map((e) => <Entry key={e.id} entry={e} />)
            })()}
          </View>
        </View>
        <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
          {t(noPlan ? 'home.planSetUp' : 'home.planForToday')}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

function Kicker({ children, color }: { children: string; color: string }) {
  return (
    <CoverKicker s={planCardSize} color={color} scale={0.053}>
      {children}
    </CoverKicker>
  )
}

function Note({ children }: { children: string }) {
  return (
    <Text fontFamily="$body" fontStyle="italic" fontSize={12} color={coverInk.textSoft}>
      {children}
    </Text>
  )
}

/** One size for every name, in capitals, cut off rather than shrunk to fit. */
function Entry({ entry }: { entry: PlanEntry }) {
  return (
    <RNText
      allowFontScaling={false}
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[
        styles.entry,
        {
          color: entry.status === 'late' ? coverInk.rubric : coverInk.text,
          opacity: entry.status === 'done' ? 0.45 : 1,
        },
      ]}
    >
      {entry.name.toLocaleUpperCase()}
    </RNText>
  )
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 9,
  },
  abs: { position: 'absolute' },
  band: {
    left: pad,
    right: pad,
    top: 0,
    height: planCardSize * 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { left: pad, right: pad, top: planCardSize * 0.26 },
  titleText: { fontFamily: coverFonts.title, fontSize: 19, lineHeight: 20, color: coverInk.text },
  entries: { left: pad, right: pad, bottom: pad * 0.9, gap: 4.5 },
  entry: { fontFamily: coverFonts.caps, fontSize: 7.5, letterSpacing: 1.2 },
})
