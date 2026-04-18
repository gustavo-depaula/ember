import { format, subWeeks } from 'date-fns'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { AlertTriangle, BookOpen, CircleDot, Compass, Flame } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Pressable } from 'react-native'
import { Text, useTheme, useThemeName, View, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  CandleFlame,
  FadeInView,
  GreenWall,
  ObligationBadges,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getManifest } from '@/content/registry'
import { useEventStore } from '@/db/events'
import { useYearCalendar } from '@/features/calendar'
import { useGratitudesCount } from '@/features/gratias'
import {
  AngelusLine,
  AppShortcuts,
  Aspiratio,
  BenedictioLine,
  CelebrationOfDay,
  ConfessioLine,
  DiesDevotion,
  HoraLine,
  IntentionHeart,
  LiturgicalHeader,
  MementoLine,
  OblatioLine,
  SeasonalContext,
  ShortcutRow,
  TimeBlockSection,
} from '@/features/home'
import { useOpenIntentionsCount } from '@/features/intentions'
import { useMemoriaEntriesCount } from '@/features/memoria'
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
import { useCurrentHour } from '@/hooks/useCurrentHour'
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

const frameCornerDark = require('../../assets/textures/frame_corner_dark.png')
const frameCornerLight = require('../../assets/textures/frame_corner_light.png')
const screenWidth = Dimensions.get('window').width
const cornerWidth = screenWidth
const darkCornerHeight = cornerWidth / (1023 / 456)
const lightCornerHeight = cornerWidth / (1584 / 672)

export default function HomeScreen() {
  const { t } = useTranslation()
  const theme = useTheme()
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
  const openIntentionsCount = useOpenIntentionsCount()
  const gratitudesCount = useGratitudesCount()
  const memoriaEntriesCount = useMemoriaEntriesCount()

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

  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')

  return (
    <ScreenLayout>
      <View position="absolute" top={-63} left={-16} pointerEvents="none" zIndex={1}>
        <Image
          source={isDark ? frameCornerDark : frameCornerLight}
          style={{ width: cornerWidth, height: isDark ? darkCornerHeight : lightCornerHeight }}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>
      <YStack gap="$lg" paddingTop={20} paddingBottom="$lg">
        <YStack gap="$md">
          <LiturgicalHeader date={now} season={season} rose={isRose} />

          <OblatioLine date={now} />

          <AngelusLine date={now} />

          <BenedictioLine />

          <HoraLine />

          <DayCarousel
            today={anchorDate}
            onSelectDate={(date) => setTimeTravelEphemeral(date === anchorDate ? undefined : date)}
          />

          <FadeInView>
            <SeasonalContext date={now} season={season} />
          </FadeInView>

          <FadeInView>
            <DiesDevotion date={now} />
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
        </YStack>

        <FadeInView>
          <YStack paddingVertical="$sm" paddingBottom="$md">
            <AppShortcuts />
          </YStack>
        </FadeInView>

        <ShortcutRow
          leading={<CandleFlame size={28} />}
          title={t('oratio.title')}
          tagline={t('oratio.homeTagline')}
          onPress={() => router.push('/oratio')}
        />

        <ShortcutRow
          leading={<CircleDot size={22} color={theme.accent?.val} />}
          title={t('kyrie.title')}
          tagline={t('kyrie.homeTagline')}
          onPress={() => router.push('/kyrie')}
        />

        <ShortcutRow
          leading={<Compass size={22} color={theme.accent?.val} />}
          title={t('examen.title')}
          tagline={t('examen.homeTagline')}
          onPress={() => router.push('/examen')}
        />

        <ShortcutRow
          leading={<IntentionHeart active={openIntentionsCount > 0} />}
          title={t('intentions.title')}
          tagline={
            openIntentionsCount > 0
              ? t('intentions.homeOpenCount', { count: openIntentionsCount })
              : t('intentions.homeTagline')
          }
          onPress={() => router.push('/intentions')}
        />

        <ShortcutRow
          leading={<Flame size={22} color={theme.accent?.val} />}
          title={t('gratias.title')}
          tagline={
            gratitudesCount > 0
              ? t('gratias.homeCount', { count: gratitudesCount })
              : t('gratias.homeTagline')
          }
          onPress={() => router.push('/gratias')}
        />

        {memoriaEntriesCount > 0 && (
          <ShortcutRow
            leading={<BookOpen size={22} color={theme.accent?.val} />}
            title={t('memoria.title')}
            tagline={t('memoria.homeTagline')}
            onPress={() => router.push('/memoria')}
          />
        )}

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
                fontWeight="bold"
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

        <PageBreakOrnament />

        <Aspiratio date={now} />

        <ConfessioLine />

        <MementoLine />
      </YStack>
    </ScreenLayout>
  )
}
