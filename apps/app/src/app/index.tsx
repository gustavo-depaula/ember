import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { AlertTriangle } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FadeInView,
  GreenWall,
  ObligationBadges,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getSeasonalSymbol } from '@/components/SectionDivider'
import { getManifest } from '@/content/registry'
import { useYearCalendar } from '@/features/calendar'
import {
  CelebrationOfDay,
  LiturgicalHeader,
  SeasonalContext,
  TimeBlockSection,
} from '@/features/home'
import {
  type BlockState,
  buildTieredWallData,
  DayCarousel,
  enrichSlot,
  filterSlotsForDate,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  type ScheduleContext,
  type TimeBlock,
  toCompletedSet,
  useCompletionRange,
  useCompletionsForDate,
  useRestartNeededPractices,
  useSlots,
  useToggleSlot,
} from '@/features/plan-of-life'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
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

export default function HomeScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
  const realNow = normalizeDate(new Date())
  const realToday = format(realNow, 'yyyy-MM-dd')
  const now = useToday()
  const selectedDate = format(now, 'yyyy-MM-dd')
  const hour = new Date().getHours()
  const currentBlock = getCurrentTimeBlock(hour)

  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
  const persistedTimeTravelDate = usePreferencesStore((s) => s.persistedTimeTravelDate)
  const anchorDate = persistedTimeTravelDate ?? realToday
  const setTimeTravelEphemeral = usePreferencesStore((s) => s.setTimeTravelDateEphemeral)
  const router = useRouter()
  const { data: slots = [] } = useSlots()

  const { season, themeName } = useMemo(() => {
    const s = getLiturgicalSeason(now, liturgicalCalendar)
    const year = now.getFullYear()
    const easter = computeEaster(year)
    const advent1 = getFirstSundayOfAdvent(year)
    const gaudete = new Date(advent1.getTime() + 14 * 86400000)
    const laetare = new Date(easter.getTime() - 21 * 86400000)
    const t = now.getTime()
    const isRose = t === normalizeDate(gaudete).getTime() || t === normalizeDate(laetare).getTime()
    return { season: s, themeName: isRose ? ('rose' as const) : s }
  }, [now, liturgicalCalendar])

  const { data: todayCompletions = [] } = useCompletionsForDate(selectedDate)
  const toggle = useToggleSlot()
  const { data: restartNeededIds = new Set<string>() } = useRestartNeededPractices()

  const handlePressItem = useCallback(
    (practiceId: string, slotId: string) => {
      const manifest = getManifest(practiceId)
      if (!manifest) {
        router.push({ pathname: '/plan/[practiceId]', params: { practiceId } })
        return
      }
      router.push({ pathname: '/pray/[practiceId]', params: { practiceId } })
    },
    [router],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const { data: wallLogs = [] } = useCompletionRange(wallStart, selectedDate)
  const { data: yearCalendar } = useYearCalendar(now.getFullYear())
  const obligations = useObligations(now)

  // biome-ignore lint/correctness/useExhaustiveDependencies: memoize by date string
  const scheduleCtx: ScheduleContext | undefined = useMemo(() => {
    if (!yearCalendar) return undefined
    const dayCalendar = getCelebrationsForDate(yearCalendar, now)
    return { season, dayCalendar }
  }, [yearCalendar, season, selectedDate])

  const todaySlots = useMemo(
    () => filterSlotsForDate(slots, selectedDate, scheduleCtx),
    [slots, selectedDate, scheduleCtx],
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

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <LiturgicalHeader date={now} season={season} themeName={themeName} />

        <DayCarousel
          today={anchorDate}
          onSelectDate={(date) => setTimeTravelEphemeral(date === anchorDate ? undefined : date)}
        />

        <FadeInView>
          <SeasonalContext date={now} season={season} />
        </FadeInView>

        <FadeInView>
          <CelebrationOfDay date={now} />
        </FadeInView>

        {obligations && (obligations.fast || obligations.abstinence !== 'none') && (
          <FadeInView>
            <YStack paddingHorizontal="$md">
              <ObligationBadges fast={obligations.fast} abstinence={obligations.abstinence} />
            </YStack>
          </FadeInView>
        )}

        <SectionDivider symbol={getSeasonalSymbol(themeName)} />

        {restartNeededIds.size > 0 && (
          <YStack gap="$sm">
            {Array.from(restartNeededIds).map((id) => {
              const m = getManifest(id)
              if (!m) return null
              return (
                <AnimatedPressable
                  key={id}
                  onPress={() =>
                    router.push({
                      pathname: '/practices/[manifestId]/program',
                      params: { manifestId: id },
                    })
                  }
                >
                  <XStack
                    backgroundColor="$backgroundSurface"
                    borderRadius="$lg"
                    padding="$md"
                    alignItems="center"
                    gap="$md"
                    borderLeftWidth={3}
                    borderLeftColor="$accent"
                  >
                    <AlertTriangle size={18} color={theme.accent?.val} />
                    <YStack flex={1}>
                      <Text fontFamily="$body" fontSize="$3" color="$color">
                        {localizeContent(m.name)}
                      </Text>
                      <Text fontFamily="$body" fontSize="$1" color="$accent">
                        {t('program.restartNeeded')}
                      </Text>
                    </YStack>
                  </XStack>
                </AnimatedPressable>
              )
            })}
          </YStack>
        )}

        <YStack gap="$md">
          <FadeInView index={1}>
            <Pressable
              onPress={() => router.push('/plan')}
              accessibilityRole="link"
              accessibilityLabel={t('a11y.viewPlanOfLife')}
            >
              <Text
                fontFamily="$heading"
                fontSize="$4"
                color="$accent"
                textAlign="center"
                letterSpacing={1}
              >
                {t('home.ruleOfLife')}
              </Text>
            </Pressable>
          </FadeInView>

          {todaySlots.length === 0 ? (
            <FadeInView index={2}>
              <Pressable onPress={() => router.push('/plan')}>
                <YStack alignItems="center" paddingHorizontal="$lg" gap="$sm">
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
            activeBlocks.map(({ block, def }, index) => {
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
            })
          )}
        </YStack>

        {wallData.length > 0 && (
          <>
            <SectionDivider />
            <FadeInView index={activeBlocks.length + 3}>
              <YStack alignItems="center" gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$accent">
                  {t('home.fidelity')}
                </Text>
                <GreenWall data={wallData} weeks={10} tiered />
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

        <PageBreakOrnament />
      </YStack>
    </ScreenLayout>
  )
}
