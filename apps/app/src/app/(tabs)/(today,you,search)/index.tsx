import { format, subWeeks } from 'date-fns'
import { Image } from 'expo-image'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName, View, YStack } from 'tamagui'

import {
  FadeInView,
  ObligationBadges,
  PageBreakOrnament,
  PageHeader,
  ScreenLayout,
  SectionDivider,
  Typography,
  VotiveWall,
} from '@/components'
import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { useCelebrationDisplay, useUpcomingCelebration, useYearCalendar } from '@/features/calendar'
import { ExploreFeatured, FromOpusDei, FromRome } from '@/features/explore'
import {
  Aspiratio,
  type CarouselPage,
  CelebrationOfDay,
  DailyCarousel,
  DiesDevotion,
  LiturgicalHeader,
  MementoLine,
  RestartNeededList,
  SaintOfDayCard,
  SeasonalContext,
  TierLegend,
  TimeBlockSection,
} from '@/features/home'
import { ContinueRow } from '@/features/library'
import {
  type BlockState,
  buildTieredWallData,
  enrichSlot,
  filterSlotsForDate,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  type ScheduleContext,
  type TimeBlock,
  useCompletedSlots,
  useCompletionDatesBySlot,
  useCompletionRange,
  usePinnedFlows,
  useProgramHidesForDate,
  useRestartNeededPractices,
  useSetSlotDone,
  useSlots,
} from '@/features/plan-of-life'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import { useSaintOfDayReading } from '@/features/saints'
import { useCurrentHour } from '@/hooks/useCurrentHour'
import { useStableToday, useToday } from '@/hooks/useToday'
import {
  getCelebrationsForDate,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
  useObligations,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

const frameCornerDark = require('../../../../assets/textures/frame_corner_dark.png')
const frameCornerLight = require('../../../../assets/textures/frame_corner_light.png')
// Matches ScreenLayout's content column maxWidth; clamping avoids the flourish
// blowing up to full browser width on the web while the column stays centered.
const cornerMaxWidth = 640
const darkCornerAspect = 1023 / 456
const lightCornerAspect = 1584 / 672

export default function HomeScreen() {
  const { t } = useTranslation()
  const now = useToday()
  const selectedDate = format(now, 'yyyy-MM-dd')
  const currentBlock = getCurrentTimeBlock(useCurrentHour())

  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const anchorDate = format(useStableToday(), 'yyyy-MM-dd')
  const isFutureDate = selectedDate > anchorDate
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const router = useRouter()
  const slots = useSlots()

  const season = useMemo(
    () => getLiturgicalSeason(now, liturgicalCalendar),
    [now, liturgicalCalendar],
  )

  const completedIds = useCompletedSlots(selectedDate)
  const setSlotDone = useSetSlotDone()
  const restartNeededIds = useRestartNeededPractices()

  const handlePressItem = useCallback(
    (item: ChecklistItem) => {
      const practiceId = item.practice_id
      const practice = useEventStore.getState().practices.get(practiceId)
      const resolvedId = practice?.active_variant ?? practiceId
      const manifest = getManifest(resolvedId)
      if (!manifest) {
        router.push({ pathname: '/plan/[practiceId]', params: { practiceId } })
        return
      }
      // Pray the active variant; the tapped slot is what the prayer completes.
      router.push({
        pathname: '/pray/[practiceId]',
        params: { practiceId: resolvedId, slotKey: item.id },
      })
    },
    [router],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const wallLogs = useCompletionRange(wallStart, selectedDate)
  const { data: yearCalendar } = useYearCalendar(now.getFullYear())
  const obligations = useObligations(now)
  const upcomingFeast = useUpcomingCelebration(14)
  const saintReading = useSaintOfDayReading()

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  const scheduleCtx: ScheduleContext | undefined = useMemo(() => {
    if (!yearCalendar) return undefined
    const dayCalendar = getCelebrationsForDate(yearCalendar, now)
    return { season, dayCalendar }
  }, [yearCalendar, season, selectedDate])

  const principalFeast = scheduleCtx?.dayCalendar?.principal
  const principalFeastDisplay = useCelebrationDisplay(principalFeast)
  const upcomingFeastDisplay = useCelebrationDisplay(upcomingFeast)
  // The devotion card's subject changes by weekday; derive it from the day's
  // line ("Today, Saint Joseph." → "Saint Joseph") for the watermark.
  const devotionDayKey = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][now.getDay()]
  const devotionSubject = t(`diesDomini.days.${devotionDayKey}.line`)
    .replace(/^[^,]*,\s*/, '')
    .replace(/\.+$/, '')
  const carouselPages: CarouselPage[] = [
    {
      key: 'devotion',
      tone: 'blue',
      watermark: devotionSubject,
      node: <DiesDevotion date={now} />,
    },
    ...(principalFeast
      ? [
          {
            key: 'celebration',
            tone: 'burgundy' as const,
            watermark: principalFeastDisplay.name,
            node: <CelebrationOfDay date={now} />,
          },
        ]
      : []),
    ...(upcomingFeast
      ? [
          {
            key: 'seasonal',
            tone: 'green' as const,
            watermark: upcomingFeastDisplay.name,
            node: <SeasonalContext date={now} />,
          },
        ]
      : []),
    ...(saintReading
      ? [
          {
            key: 'saint',
            tone: 'gold' as const,
            watermark: saintReading.name,
            node: <SaintOfDayCard />,
          },
        ]
      : []),
  ]

  const completionsBySlot = useCompletionDatesBySlot()
  const programHides = useProgramHidesForDate(selectedDate)
  const todaySlots = useMemo(
    () =>
      filterSlotsForDate(slots, selectedDate, scheduleCtx, completionsBySlot).filter(
        (s) => !programHides.has(s.id),
      ),
    [slots, selectedDate, scheduleCtx, completionsBySlot, programHides],
  )
  // Rows render through enrichSlot on every pass, so this only needs to trigger
  // one once a pinned slot's flow arrives.
  usePinnedFlows(todaySlots)
  const wallData = useMemo(() => buildTieredWallData(wallLogs, slots), [wallLogs, slots])

  const [overrides, setOverrides] = useState<Partial<Record<TimeBlock, BlockState>>>({})

  const toggleBlockCollapse = useCallback((block: TimeBlock, shown: BlockState) => {
    setOverrides((prev) => ({ ...prev, [block]: shown === 'expanded' ? 'collapsed' : 'expanded' }))
  }, [])

  // Overrides also hold a block open once its last practice is ticked, so the
  // list never folds up under the user's finger. They clear on leaving the tab
  // or the day, and finished blocks tidy away on the next look.
  useFocusEffect(useCallback(() => () => setOverrides({}), []))
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when the day changes
  useEffect(() => setOverrides({}), [selectedDate])

  const activeBlocks = useMemo(() => getActiveBlocks(todaySlots), [todaySlots])
  const shownBlocks = activeBlocks.map(({ block, def }) => ({
    block,
    def,
    state:
      overrides[block] ??
      getBlockState(
        block,
        currentBlock,
        completedIds,
        def.slots.map((s) => s.id),
      ),
  }))
  const totalSlots = todaySlots.length
  const completedCount = todaySlots.filter((s) => completedIds.has(s.id)).length

  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')

  // On notched platforms (iOS) the safe-area inset gives the corner ornament
  // breathing room. On web/Android-no-notch the inset is 0, which lets the
  // ornament's top edge get clipped above the viewport — add a virtual notch.
  const insets = useSafeAreaInsets()
  const noNotchTopPad = insets.top === 0 ? 32 : 0

  const { width: windowWidth } = useWindowDimensions()
  const cornerWidth = Math.min(windowWidth, cornerMaxWidth)
  const cornerHeight = cornerWidth / (isDark ? darkCornerAspect : lightCornerAspect)

  return (
    <ScreenLayout>
      <View
        position="absolute"
        top={noNotchTopPad - (isDark ? 78 : 73)}
        left={-16}
        style={{ pointerEvents: 'none' }}
        zIndex={1}
      >
        <Image
          source={isDark ? frameCornerDark : frameCornerLight}
          style={{ width: cornerWidth, height: cornerHeight }}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>

      <YStack gap="$lg" paddingTop={5 + noNotchTopPad} paddingBottom="$lg">
        <YStack gap="$md">
          <LiturgicalHeader
            date={now}
            season={season}
            today={anchorDate}
            onSelectDate={(date) => setTimeTravelEphemeral(date === anchorDate ? undefined : date)}
          />

          <FadeInView>
            <DailyCarousel pages={carouselPages} />
          </FadeInView>
        </YStack>

        <YStack>
          <FadeInView index={1}>
            <YStack>
              <Pressable
                onPress={() => router.navigate('/(tabs)/(you)/you')}
                accessibilityRole="link"
                accessibilityLabel={t('a11y.viewPlanOfLife')}
              >
                <Typography variant="screen-title" tone="muted" fontSize="$5">
                  {t('home.ruleOfLife')}
                </Typography>
              </Pressable>
            </YStack>
          </FadeInView>

          {obligations && (obligations.fast || obligations.abstinence !== 'none') && (
            <FadeInView index={1}>
              <ObligationBadges fast={obligations.fast} abstinence={obligations.abstinence} />
            </FadeInView>
          )}

          {todaySlots.length === 0 ? (
            <FadeInView index={2}>
              <Pressable
                onPress={() => router.navigate('/(tabs)/(you)/you')}
                accessibilityRole="link"
                accessibilityLabel={t('home.emptyPlanAction')}
              >
                <YStack alignItems="center" paddingHorizontal="$lg" gap="$sm" marginTop="$md">
                  <Typography tone="muted" fontSize="$2" textAlign="center">
                    {t('home.emptyPlan')}
                  </Typography>
                  <Typography fontSize="$2" fontWeight="500" color="$accent">
                    {t('home.emptyPlanAction')}
                  </Typography>
                </YStack>
              </Pressable>
            </FadeInView>
          ) : (
            <YStack gap="$md" marginTop="$md">
              {shownBlocks.map(({ block, def, state }, index) => {
                const { completed, total } = getBlockCompletion(
                  def.slots.map((s) => s.id),
                  completedIds,
                )

                return (
                  <FadeInView key={block} index={index + 2}>
                    <TimeBlockSection
                      label={t(`timeBlock.${block}`)}
                      items={def.slots.map((s) => enrichSlot(s, t))}
                      completedIds={completedIds}
                      restartNeededIds={restartNeededIds}
                      state={state}
                      completed={completed}
                      total={total}
                      readOnly={isFutureDate}
                      onToggle={(item, done) => {
                        if (!overrides[block]) setOverrides((prev) => ({ ...prev, [block]: state }))
                        setSlotDone.mutate({ slotKey: item.id, date: selectedDate, done })
                      }}
                      onToggleCollapse={() => toggleBlockCollapse(block, state)}
                      onPressItem={handlePressItem}
                    />
                  </FadeInView>
                )
              })}
              <TierLegend
                tiers={shownBlocks
                  .filter(({ state }) => state === 'expanded')
                  .flatMap(({ def }) => def.slots)
                  .filter((s) => !completedIds.has(s.id))
                  .map((s) => s.tier)}
              />
            </YStack>
          )}

          <RestartNeededList ids={restartNeededIds} />
        </YStack>

        <ContinueRow />

        <ExploreFeatured />

        <PageBreakOrnament />

        <Aspiratio date={now} />

        <MementoLine />

        {todaySlots.length > 0 && (
          <>
            <SectionDivider />
            <FadeInView index={activeBlocks.length + 3}>
              <YStack alignItems="center" gap="$sm">
                <Typography variant="label" fontSize="$2">
                  {t('home.fidelity')}
                </Typography>
                <VotiveWall data={wallData} weeks={10} tiered />
                {totalSlots > 0 && completedCount === totalSlots && (
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
  )
}
