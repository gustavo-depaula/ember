import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'

import {
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
  type TimeBlock,
  toCompletedSet,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen() {
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
            {format(now, 'EEE, MMMM d')}
          </Text>
        </YStack>

        <XStack gap="$md">
          <YStack flex={1}>
            <NavigationMedallion
              icon="book"
              title="Divine Office"
              subtitle="Lauds, Vespers & Compline"
              onPress={() => router.push('/office')}
            />
          </YStack>
          <YStack flex={1}>
            <NavigationMedallion
              icon="quill"
              title="Plan of Life"
              subtitle="Practices & progress"
              onPress={() => router.push('/plan')}
            />
          </YStack>
        </XStack>

        <XStack gap="$md">
          <YStack flex={1}>
            <NavigationMedallion
              icon="cross"
              title="Sacred Scripture"
              subtitle="Read the Bible"
              onPress={() => router.push('/bible')}
            />
          </YStack>
          <YStack flex={1}>
            <NavigationMedallion
              icon="book"
              title="Catechism"
              subtitle="Read the CCC"
              onPress={() => router.push('/catechism')}
            />
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
                  label={def.label}
                  practices={def.practices}
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
          <ManuscriptFrame ornate={false}>
            <YStack alignItems="center" gap="$sm">
              <Text fontFamily="$display" fontSize={18} lineHeight={22} color="$accent">
                Fidelity
              </Text>
              <GreenWall data={wallData} weeks={10} tiered />
            </YStack>
          </ManuscriptFrame>
        )}

        <OrnamentalRule />
      </YStack>
    </ScreenLayout>
  )
}
