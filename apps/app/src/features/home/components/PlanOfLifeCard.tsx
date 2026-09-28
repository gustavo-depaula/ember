import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text as RNText, StyleSheet, View } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { CoverKicker, OrdoSheet } from '@/features/covers'
import { coverFonts, coverInk } from '@/features/covers/parts'
import { type BlockTone, jewelTones } from '@/features/explore/bgColor'
import {
  getActiveBlocks,
  getCurrentTimeBlock,
  getSlotName,
  getSlotPinLabel,
} from '@/features/plan-of-life'
import { useCurrentHour } from '@/hooks/useCurrentHour'
import { type DayStanding, entriesAround, type PlanEntry, planStanding } from '../planStanding'
import type { TodayPlan } from '../useTodayPlan'

export const planCardSize = 160
const pad = planCardSize * 0.09
const shownEntries = 5

// The heading band is the day's light: green on track, gold with something
// due now, red once a part of the day has slipped by.
const bandTone: Record<DayStanding, BlockTone> = {
  done: jewelTones.green,
  ontrack: jewelTones.green,
  due: jewelTones.gold,
  late: jewelTones.red,
}

/**
 * Today's plan of life as a page of the Ordo: the band carries the day's
 * standing and count, and beneath the title the practices around this time of
 * day — missed ones in rubric, prayed ones faded.
 */
export function PlanOfLifeCard({
  plan: { todaySlots, completedIds, pinnedFlows },
  onPress,
}: {
  plan: TodayPlan
  onPress: () => void
}) {
  const { t } = useTranslation()
  const current = getCurrentTimeBlock(useCurrentHour())

  // biome-ignore lint/correctness/useExhaustiveDependencies: pinnedFlows re-derives pinned slots' names as their flows load
  const { day, shown } = useMemo(() => {
    const blocks = getActiveBlocks(todaySlots).map(({ block, def }) => ({
      block,
      slots: def.slots.map((s) => ({ id: s.id, name: getSlotPinLabel(s) ?? getSlotName(s, t) })),
    }))
    const day = planStanding(blocks, completedIds, current)
    return { day, shown: entriesAround(day.entries, current, shownEntries) }
  }, [todaySlots, completedIds, current, t, pinnedFlows])
  const total = day.entries.length

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.openTodayPlan')}
    >
      <YStack width={planCardSize} gap="$sm">
        <View style={[styles.shadow, { width: planCardSize, height: planCardSize }]}>
          <OrdoSheet tone={bandTone[day.standing]} s={planCardSize} />

          {total > 0 && (
            <View style={[styles.abs, styles.band]}>
              <Kicker color={coverInk.cream}>
                {t('home.planCount', { done: day.done, total }).toLocaleUpperCase()}
              </Kicker>
              <Kicker color={coverInk.gold}>
                {t(`home.planStanding.${day.standing}`).toLocaleUpperCase()}
              </Kicker>
            </View>
          )}

          <View style={[styles.abs, styles.title]}>
            {/* Fixed size: CoverText's shrink-to-fit collapses it on device. */}
            <RNText allowFontScaling={false} numberOfLines={1} style={styles.titleText}>
              {t('home.planOfLife')}
            </RNText>
          </View>

          <View style={[styles.abs, styles.entries]}>
            {day.standing === 'done' && total > 0 ? (
              <Text fontFamily="$body" fontStyle="italic" fontSize={12} color={coverInk.textSoft}>
                Pax Christi.
              </Text>
            ) : (
              shown.map((e) => <Entry key={e.id} entry={e} />)
            )}
          </View>
        </View>
        <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
          {t('home.planForToday')}
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
