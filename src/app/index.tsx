import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import {
  FadeInView,
  GreenWall,
  PageBreakOrnament,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import { getSeasonalSymbol } from '@/components/SectionDivider'
import { getManifest } from '@/content/practices'
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
  type TimeBlock,
  toCompletedSet,
  useCompletionRange,
  useCompletionsForDate,
  useSlots,
  useToggleSlot,
} from '@/features/plan-of-life'
import { parseSlotKey } from '@/lib/slotKey'
import { useToday } from '@/hooks/useToday'
import {
  computeEaster,
  getFirstSundayOfAdvent,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
  normalizeDate,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export default function HomeScreen() {
  const { t } = useTranslation()
  const realNow = normalizeDate(new Date())
  const realToday = format(realNow, 'yyyy-MM-dd')
  const now = useToday()
  const selectedDate = format(now, 'yyyy-MM-dd')
  const hour = new Date().getHours()
  const currentBlock = getCurrentTimeBlock(hour)

  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm
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

  const handlePressItem = useCallback(
    (practiceId: string, slotId: string) => {
      const manifest = getManifest(practiceId)
      if (!manifest) {
        router.push(`/plan/${practiceId}` as any)
        return
      }
      if (manifest.flows.length > 1 && slotId !== 'default') {
        router.push(`/pray/${practiceId}?flow=${slotId}` as any)
      } else if (manifest.flows.length > 1) {
        router.push(`/plan/${practiceId}` as any)
      } else {
        router.push(`/pray/${practiceId}` as any)
      }
    },
    [router],
  )
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const { data: wallLogs = [] } = useCompletionRange(wallStart, selectedDate)

  const todaySlots = useMemo(() => filterSlotsForDate(slots, selectedDate), [slots, selectedDate])
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
          today={realToday}
          onSelectDate={(date) => setTimeTravelEphemeral(date === realToday ? undefined : date)}
        />

        <FadeInView>
          <SeasonalContext date={now} season={season} />
        </FadeInView>

        <FadeInView>
          <CelebrationOfDay date={now} />
        </FadeInView>

        <SectionDivider symbol={getSeasonalSymbol(themeName)} />

        {todaySlots.length > 0 && (
          <YStack gap="$md">
            <FadeInView index={1}>
              <Pressable onPress={() => router.push('/plan')}>
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
