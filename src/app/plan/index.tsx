import { format, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { GreenWall, HeaderFlourish, ManuscriptFrame, ScreenLayout } from '@/components'
import {
  buildTieredWallData,
  type DayCompletion,
  filterPracticesForDate,
  getCompletionRate,
  getCurrentStreak,
  getPracticeIcon,
  PracticeChecklist,
  toCompletedSet,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'

export default function PlanScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [selectedDay, setSelectedDay] = useState<string>()

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const rangeStart = useMemo(() => format(subWeeks(new Date(), 20), 'yyyy-MM-dd'), [])

  const { data: practices = [] } = usePractices()
  const { data: rangeLogs = [] } = usePracticeLogRange(rangeStart, today)
  const { data: todayLogs = [] } = usePracticeLogsForDate(today)
  const toggle = useTogglePractice()

  const todayPractices = useMemo(() => filterPracticesForDate(practices, today), [practices, today])
  const completedToday = useMemo(() => toCompletedSet(todayLogs), [todayLogs])

  const { wallData, stats } = useMemo(() => {
    const wd = buildTieredWallData(rangeLogs, practices)

    const countsByDate = new Map<string, number>()
    for (const log of rangeLogs) {
      countsByDate.set(log.date, (countsByDate.get(log.date) ?? 0) + 1)
    }
    const totalPractices = practices.length || 1
    const dailyCompletions: DayCompletion[] = Array.from(countsByDate, ([date, completed]) => ({
      date,
      completed,
      total: totalPractices,
    }))

    return {
      wallData: wd,
      stats: {
        streak: getCurrentStreak(dailyCompletions),
        rate: getCompletionRate(dailyCompletions),
      },
    }
  }, [rangeLogs, practices])

  const { data: selectedDayLogs = [] } = usePracticeLogsForDate(selectedDay)
  const selectedDayCompleted = useMemo(() => toCompletedSet(selectedDayLogs), [selectedDayLogs])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack justifyContent="flex-end" alignItems="center">
          <Pressable onPress={() => router.push('/plan/settings')} hitSlop={8}>
            <Settings size={22} color={theme.colorSecondary.val} />
          </Pressable>
        </XStack>

        <YStack alignItems="center" gap="$xs">
          <HeaderFlourish />
          <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$color">
            Plan of Life
          </Text>
        </YStack>

        <YStack alignItems="center">
          <GreenWall
            data={wallData}
            tiered
            onDayPress={(date) => setSelectedDay((prev) => (prev === date ? undefined : date))}
          />
        </YStack>

        {stats.streak === 0 && stats.rate === 0 && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            Complete your daily practices to fill the wall
          </Text>
        )}

        {selectedDay && (
          <ManuscriptFrame ornate={false}>
            <YStack gap="$sm">
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                {selectedDay}
              </Text>
              {practices.map((p) => (
                <XStack key={p.id} gap="$sm" alignItems="center">
                  <Text fontSize={16}>{getPracticeIcon(p.icon)}</Text>
                  <Text
                    flex={1}
                    fontFamily="$body"
                    fontSize="$2"
                    color={selectedDayCompleted.has(p.id) ? '$color' : '$colorSecondary'}
                  >
                    {p.name}
                  </Text>
                  <Text
                    fontSize={12}
                    color={selectedDayCompleted.has(p.id) ? '$accent' : '$colorSecondary'}
                  >
                    {selectedDayCompleted.has(p.id) ? '✓' : '–'}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </ManuscriptFrame>
        )}

        <XStack gap="$md">
          <YStack
            flex={1}
            alignItems="center"
            gap="$xs"
            borderWidth={0.5}
            borderColor="$accentSubtle"
            borderRadius="$md"
            padding="$md"
          >
            <Text fontFamily="$heading" fontSize="$5" color="$accent">
              {stats.streak}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              Day Streak
            </Text>
          </YStack>
          <YStack
            flex={1}
            alignItems="center"
            gap="$xs"
            borderWidth={0.5}
            borderColor="$accentSubtle"
            borderRadius="$md"
            padding="$md"
          >
            <Text fontFamily="$heading" fontSize="$5" color="$accent">
              {Math.round(stats.rate * 100)}%
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              Completion
            </Text>
          </YStack>
        </XStack>

        <Text fontFamily="$heading" fontSize="$4" color="$color">
          Today
        </Text>

        <PracticeChecklist
          practices={todayPractices}
          completedIds={completedToday}
          onToggle={(id, completed) => toggle.mutate({ practiceId: id, date: today, completed })}
          onRowPress={(id) => router.push(`/plan/${id}`)}
        />
      </YStack>
    </ScreenLayout>
  )
}
