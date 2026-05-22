import { format, subWeeks } from 'date-fns'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useThemeName, View, YStack } from 'tamagui'

import {
  FadeInView,
  GreenWall,
  ObligationBadges,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { useUpcomingCelebration, useYearCalendar } from '@/features/calendar'
import { LatestRow } from '@/features/creators/home/LatestRow'
import {
  AppShortcuts,
  Aspiratio,
  type CarouselPage,
  CelebrationOfDay,
  ConfessioLine,
  DailyCarousel,
  DiesDevotion,
  LiturgicalHeader,
  MementoLine,
  OfflineCoverageLine,
  ResolutionLine,
  RestartNeededList,
  SeasonalContext,
  TimeBlockSection,
} from '@/features/home'
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
  toCompletedSet,
  useCompletionDatesBySlot,
  useCompletionRange,
  useCompletionsForDate,
  useRestartNeededPractices,
  useSlots,
  useToggleSlot,
} from '@/features/plan-of-life'
import { useCurrentHour } from '@/hooks/useCurrentHour'
import { useToday } from '@/hooks/useToday'
import {
  computeEaster,
  getCelebrationsForDate,
  getFirstSundayOfAdvent,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
  normalizeDate,
  useObligations,
} from '@/lib/liturgical'
import { parseSlotKey } from '@/lib/slotKey'
import { usePreferencesStore } from '@/stores/preferencesStore'

const frameCornerDark = require('../../assets/textures/frame_corner_dark.png')
const frameCornerLight = require('../../assets/textures/frame_corner_light.png')
// Matches ScreenLayout's content column maxWidth; clamping avoids the flourish
// blowing up to full browser width on the web while the column stays centered.
const cornerMaxWidth = 640
const darkCornerAspect = 1023 / 456
const lightCornerAspect = 1584 / 672

export default function HomeScreen() {
  const { t } = useTranslation()
  const realNow = normalizeDate(new Date())
  const realToday = format(realNow, 'yyyy-MM-dd')
  const now = useToday()
  const selectedDate = format(now, 'yyyy-MM-dd')
  const currentBlock = getCurrentTimeBlock(useCurrentHour())

  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const persistedTimeTravelDate = usePreferencesStore((s) => s.persistedTimeTravelDate)
  const anchorDate = persistedTimeTravelDate ?? realToday
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const router = useRouter()
  const slots = useSlots()

  const { season, isRose } = useMemo(() => {
    const s = getLiturgicalSeason(now, liturgicalCalendar)
    const year = now.getFullYear()
    const easter = computeEaster(year)
    const advent1 = getFirstSundayOfAdvent(year)
    const gaudete = new Date(advent1.getTime() + 14 * 86400000)
    const laetare = new Date(easter.getTime() - 21 * 86400000)
    const t = now.getTime()
    const rose = t === normalizeDate(gaudete).getTime() || t === normalizeDate(laetare).getTime()
    return { season: s, isRose: rose }
  }, [now, liturgicalCalendar])

  const todayCompletions = useCompletionsForDate(selectedDate)
  const toggle = useToggleSlot()
  const restartNeededIds = useRestartNeededPractices()

  const handlePressItem = useCallback(
    (practiceId: string) => {
      const practice = useEventStore.getState().practices.get(practiceId)
      const resolvedId = practice?.active_variant ?? practiceId
      const manifest = getManifest(resolvedId)
      if (!manifest) {
        router.push({ pathname: '/plan/[practiceId]', params: { practiceId } })
        return
      }
      router.push({ pathname: '/pray/[practiceId]', params: { practiceId: resolvedId } })
    },
    [router],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const wallLogs = useCompletionRange(wallStart, selectedDate)
  const { data: yearCalendar } = useYearCalendar(now.getFullYear())
  const obligations = useObligations(now)
  const hasUpcomingFeast = !!useUpcomingCelebration(14)

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  const scheduleCtx: ScheduleContext | undefined = useMemo(() => {
    if (!yearCalendar) return undefined
    const dayCalendar = getCelebrationsForDate(yearCalendar, now)
    return { season, dayCalendar }
  }, [yearCalendar, season, selectedDate])

  const completionsBySlot = useCompletionDatesBySlot()
  const todaySlots = useMemo(
    () => filterSlotsForDate(slots, selectedDate, scheduleCtx, completionsBySlot),
    [slots, selectedDate, scheduleCtx, completionsBySlot],
  )
  const completedIds = useMemo(() => toCompletedSet(todayCompletions), [todayCompletions])
  const wallData = useMemo(() => buildTieredWallData(wallLogs, slots), [wallLogs, slots])

  const [overrides, setOverrides] = useState<Partial<Record<TimeBlock, BlockState>>>({})

  const toggleBlockCollapse = useCallback((block: TimeBlock) => {
    setOverrides((prev) => {
      const current = prev[block]
      if (current === 'expanded') {
        return { ...prev, [block]: 'collapsed' }
      }
      return { ...prev, [block]: 'expanded' }
    })
  }, [])

  const activeBlocks = useMemo(() => getActiveBlocks(todaySlots), [todaySlots])
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
            rose={isRose}
            today={anchorDate}
            onSelectDate={(date) => setTimeTravelEphemeral(date === anchorDate ? undefined : date)}
          />

          <FadeInView>
            <DailyCarousel
              pages={
                [
                  { key: 'devotion', node: <DiesDevotion date={now} /> },
                  scheduleCtx?.dayCalendar?.principal && {
                    key: 'celebration',
                    node: <CelebrationOfDay date={now} />,
                  },
                  hasUpcomingFeast && {
                    key: 'seasonal',
                    node: <SeasonalContext date={now} />,
                  },
                ].filter(Boolean) as CarouselPage[]
              }
            />
          </FadeInView>
        </YStack>

        <YStack gap="$md">
          <FadeInView>
            <AppShortcuts />
          </FadeInView>

          <LatestRow />
        </YStack>

        <YStack gap="$md">
          <FadeInView index={1}>
            <YStack alignItems="center" gap="$sm">
              <Pressable
                onPress={() => router.push('/plan')}
                accessibilityRole="link"
                accessibilityLabel={t('a11y.viewPlanOfLife')}
              >
                <Text
                  fontFamily="$heading"
                  fontSize="$5"
                  color="$color"
                  textAlign="center"
                  letterSpacing={3}
                  textTransform="uppercase"
                >
                  {t('home.ruleOfLife')}
                </Text>
              </Pressable>
              <View
                width={120}
                borderBottomWidth={0.5}
                borderColor="$accentSubtle"
                marginTop="$xs"
              />
            </YStack>
          </FadeInView>

          <FadeInView index={1}>
            <ResolutionLine />
          </FadeInView>

          {obligations && (obligations.fast || obligations.abstinence !== 'none') && (
            <FadeInView index={1}>
              <ObligationBadges fast={obligations.fast} abstinence={obligations.abstinence} />
            </FadeInView>
          )}

          {todaySlots.length === 0 ? (
            <FadeInView index={2}>
              <Pressable
                onPress={() => router.push('/plan')}
                accessibilityRole="link"
                accessibilityLabel={t('home.emptyPlanAction')}
              >
                <YStack alignItems="center" paddingHorizontal="$lg" gap="$sm" marginTop="$md">
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
                    {t('home.emptyPlan')}
                  </Text>
                  <Text fontFamily="$heading" fontSize="$2" color="$accent">
                    {t('home.emptyPlanAction')}
                  </Text>
                </YStack>
              </Pressable>
            </FadeInView>
          ) : (
            <YStack gap="$md" marginTop="$md">
              {activeBlocks.map(({ block, def }, index) => {
                const blockSlotIds = def.slots.map((s) => s.id)
                const { completed, total } = getBlockCompletion(blockSlotIds, completedIds)
                const autoState = getBlockState(block, currentBlock, completedIds, blockSlotIds)
                const state = overrides[block] ?? autoState

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
                      onToggle={(item, done) =>
                        toggle.mutate({
                          practiceId: item.practice_id,
                          slotId: parseSlotKey(item.id).slotId,
                          date: selectedDate,
                          completed: done,
                        })
                      }
                      onToggleCollapse={() => toggleBlockCollapse(block)}
                      onPressItem={handlePressItem}
                    />
                  </FadeInView>
                )
              })}
            </YStack>
          )}

          <RestartNeededList ids={restartNeededIds} />

          <OfflineCoverageLine />
        </YStack>

        <PageBreakOrnament />

        <Aspiratio date={now} />

        <ConfessioLine />

        <MementoLine />

        {todaySlots.length > 0 && (
          <>
            <SectionDivider />
            <FadeInView index={activeBlocks.length + 3}>
              <YStack alignItems="center" gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$accent">
                  {t('home.fidelity')}
                </Text>
                <GreenWall data={wallData} weeks={10} tiered />
                {totalSlots > 0 && completedCount === totalSlots && (
                  <Text fontFamily="$script" fontSize="$3" color="$accent" fontStyle="italic">
                    Pax Christi.
                  </Text>
                )}
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('home.todayProgress', {
                    completed: completedCount,
                    total: totalSlots,
                  })}
                </Text>
              </YStack>
            </FadeInView>
          </>
        )}
      </YStack>
    </ScreenLayout>
  )
}
