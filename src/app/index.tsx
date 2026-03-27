import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import {
  FadeInView,
  GreenWall,
  HeaderFlourish,
  ManuscriptFrame,
  OrnamentalRule,
  ScreenLayout,
} from '@/components'
import { NavigationMedallion, TimeBlockSection } from '@/features/home'
import {
  type BlockState,
  buildTieredWallData,
  filterPracticesForDate,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  getPracticeName,
  type TimeBlock,
  toCompletedSet,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'
import i18n from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return i18n.t('home.greetingMorning')
  if (hour >= 12 && hour < 17) return i18n.t('home.greetingAfternoon')
  return i18n.t('home.greetingEvening')
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const currentBlock = getCurrentTimeBlock(hour)

  const { data: practices = [] } = usePractices()
  const { data: todayLogs = [] } = usePracticeLogsForDate(today)
  const toggle = useTogglePractice()
  const wallStart = format(subWeeks(now, 9), 'yyyy-MM-dd')
  const { data: wallLogs = [] } = usePracticeLogRange(wallStart, today)

  const todayPractices = useMemo(() => filterPracticesForDate(practices, today), [practices, today])
  const completedIds = useMemo(() => toCompletedSet(todayLogs), [todayLogs])
  const wallData = useMemo(() => buildTieredWallData(wallLogs, practices), [wallLogs, practices])

  // manual overrides for collapse/expand
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

  const activeBlocks = useMemo(() => getActiveBlocks(todayPractices), [todayPractices])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack gap="$xs" alignItems="center">
          <HeaderFlourish />
          <Text fontFamily="$heading" fontSize="$5" color="$color">
            {greeting}
          </Text>
          <Text fontFamily="$script" fontSize="$2" color="$colorSecondary">
            {formatLocalized(now, 'EEE, MMMM d')}
          </Text>
        </YStack>

        <XStack gap="$md">
          <YStack flex={1}>
            <FadeInView index={0}>
              <NavigationMedallion
                icon="book"
                title={t('home.divineOffice')}
                subtitle={t('home.divineOfficeSub')}
                onPress={() => router.push('/office')}
              />
            </FadeInView>
          </YStack>
          <YStack flex={1}>
            <FadeInView index={1}>
              <NavigationMedallion
                icon="quill"
                title={t('home.planOfLife')}
                subtitle={t('home.planOfLifeSub')}
                onPress={() => router.push('/plan')}
              />
            </FadeInView>
          </YStack>
        </XStack>

        <XStack gap="$md">
          <YStack flex={1}>
            <FadeInView index={2}>
              <NavigationMedallion
                icon="cross"
                title={t('home.sacredScripture')}
                subtitle={t('home.sacredScriptureSub')}
                onPress={() => router.push('/bible')}
              />
            </FadeInView>
          </YStack>
          <YStack flex={1}>
            <FadeInView index={3}>
              <NavigationMedallion
                icon="book"
                title={t('home.catechism')}
                subtitle={t('home.catechismSub')}
                onPress={() => router.push('/catechism')}
              />
            </FadeInView>
          </YStack>
        </XStack>

        {todayPractices.length > 0 && (
          <YStack gap="$md">
            {activeBlocks.map(({ block, def }, i) => {
              const blockPracticeIds = def.practices.map((p) => p.id)
              const { completed, total } = getBlockCompletion(blockPracticeIds, completedIds)
              const autoState = getBlockState(block, currentBlock, completedIds, blockPracticeIds)
              const state = overrides[block] ?? autoState

              return (
                <TimeBlockSection
                  key={block}
                  label={t(`timeBlock.${block}`)}
                  practices={def.practices.map((p) => ({ ...p, name: getPracticeName(p, t) }))}
                  completedIds={completedIds}
                  state={state}
                  completed={completed}
                  total={total}
                  showRule={i < activeBlocks.length - 1 && state === 'expanded'}
                  onToggle={(id, done) =>
                    toggle.mutate({ practiceId: id, date: today, completed: done })
                  }
                  onToggleCollapse={() => toggleBlockCollapse(block)}
                />
              )
            })}
          </YStack>
        )}

        {wallData.length > 0 && (
          <FadeInView>
            <ManuscriptFrame ornate={false}>
              <YStack alignItems="center" gap="$sm">
                <Text fontFamily="$display" fontSize={18} lineHeight={22} color="$accent">
                  {t('home.fidelity')}
                </Text>
                <GreenWall data={wallData} weeks={10} tiered />
              </YStack>
            </ManuscriptFrame>
          </FadeInView>
        )}

        <OrnamentalRule />
      </YStack>
    </ScreenLayout>
  )
}
