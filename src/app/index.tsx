import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Pressable } from 'react-native'
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
  toCompletedSet,
  toGreenWallData,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'
import {
  type BlockState,
  blockOrder,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  type TimeBlock,
  timeBlocks,
} from '@/features/plan-of-life/timeBlocks'

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

  const completedIds = toCompletedSet(todayLogs)
  const wallData = useMemo(
    () => toGreenWallData(wallLogs, practices.length),
    [wallLogs, practices.length],
  )

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

  const practiceMap = useMemo(() => new Map(practices.map((p) => [p.id, p])), [practices])

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

        <NavigationMedallion
          icon="cross"
          title="Sacred Scripture"
          subtitle="Read the Bible"
          onPress={() => router.push('/bible')}
        />

        {practices.length > 0 && (
          <YStack gap="$md">
            {blockOrder.map((block, i) => {
              const def = timeBlocks[block]
              const blockPractices = def.practiceIds
                .map((id) => practiceMap.get(id))
                .filter(Boolean) as Array<{ id: string; name: string; icon: string }>
              const { completed, total } = getBlockCompletion(block, completedIds)
              const autoState = getBlockState(block, currentBlock, completedIds)
              const state = overrides[block] ?? autoState

              return (
                <TimeBlockSection
                  key={block}
                  label={def.label}
                  practices={blockPractices}
                  completedIds={completedIds}
                  state={state}
                  completed={completed}
                  total={total}
                  showRule={i < blockOrder.length - 1 && state === 'expanded'}
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
              <GreenWall data={wallData} weeks={10} />
            </YStack>
          </ManuscriptFrame>
        )}

        <OrnamentalRule />
        <Pressable onPress={() => router.push('/settings')}>
          <Text fontFamily="$script" fontSize="$2" color="$accent" textAlign="center">
            Preferences & Reading Progress
          </Text>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
