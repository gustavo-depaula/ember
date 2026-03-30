import { format, parseISO, subDays, subWeeks } from 'date-fns'
import { useRouter } from 'expo-router'
import { SlidersHorizontal } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  AnimatedPressable,
  GreenWall,
  HeaderFlourish,
  ScreenLayout,
  SectionDivider,
} from '@/components'
import {
  buildTieredWallData,
  DayCarousel,
  type DayCompletion,
  filterPracticesForDate,
  getCompletionRate,
  getCurrentStreak,
  getPracticeIconKey,
  getPracticeName,
  PracticeChecklist,
  toCompletedSet,
  useCompletionRange,
  useCompletionsForDate,
  usePractices,
  useTogglePractice,
} from '@/features/plan-of-life'
import { formatLocalized } from '@/lib/i18n/dateLocale'

const editableWindowDays = 3

export default function PlanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const rangeStart = useMemo(() => format(subWeeks(new Date(), 20), 'yyyy-MM-dd'), [])
  const [todayTrigger, setTodayTrigger] = useState(0)
  const goToToday = useCallback(() => setTodayTrigger((n) => n + 1), [])

  const { data: practices = [] } = usePractices()
  const { data: rangeLogs = [] } = useCompletionRange(rangeStart, today)
  const { data: selectedDateCompletions = [] } = useCompletionsForDate(selectedDate)
  const toggle = useTogglePractice()

  const selectedPractices = useMemo(
    () => filterPracticesForDate(practices, selectedDate),
    [practices, selectedDate],
  )
  const selectedCompleted = useMemo(
    () => toCompletedSet(selectedDateCompletions),
    [selectedDateCompletions],
  )

  const isFuture = selectedDate > today
  const editableCutoff = useMemo(
    () => format(subDays(new Date(), editableWindowDays), 'yyyy-MM-dd'),
    [],
  )
  const isEditable = !isFuture && selectedDate > editableCutoff

  const isToday = selectedDate === today
  const dateLabel = isToday ? t('plan.today') : formatLocalized(parseISO(selectedDate), 'EEE d MMM')

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

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack alignItems="center" gap="$xs">
          <HeaderFlourish />
          <Text fontFamily="$display" fontSize={28} lineHeight={34} color="$color">
            {t('plan.title')}
          </Text>
        </YStack>

        <YStack alignItems="center">
          <GreenWall data={wallData} tiered />
        </YStack>

        {stats.streak === 0 && stats.rate === 0 && (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            {t('plan.emptyWall')}
          </Text>
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
              {t('plan.dayStreak')}
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
              {t('plan.completion')}
            </Text>
          </YStack>
        </XStack>

        <AnimatedPressable onPress={() => router.push('/plan/settings')}>
          <XStack
            alignItems="center"
            justifyContent="center"
            gap="$sm"
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderWidth={0.5}
            borderColor="$accentSubtle"
            borderRadius="$md"
            borderStyle="dashed"
            alignSelf="center"
          >
            <SlidersHorizontal size={16} color={theme.accent.val} />
            <Text fontFamily="$heading" fontSize="$2" color="$accent">
              {t('plan.customize')}
            </Text>
          </XStack>
        </AnimatedPressable>

        <YStack gap="$xs">
          <SectionDivider />
          <AnimatedPressable onPress={goToToday} disabled={isToday}>
            <Text
              fontFamily="$heading"
              fontSize="$3"
              color="$accent"
              textAlign="center"
              opacity={isToday ? 0 : 1}
            >
              {t('plan.today')} ›
            </Text>
          </AnimatedPressable>
        </YStack>
        <DayCarousel onSelectDate={setSelectedDate} today={today} todayTrigger={todayTrigger} />

        <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
          {dateLabel}
          {isFuture ? ` · ${t('plan.preview')}` : ''}
        </Text>

        <PracticeChecklist
          practices={selectedPractices.map((p) => ({
            ...p,
            name: getPracticeName(p, t),
            icon: getPracticeIconKey(p),
          }))}
          completedIds={selectedCompleted}
          onToggle={(id, completed) =>
            toggle.mutate({ practiceId: id, date: selectedDate, completed })
          }
          onRowPress={(id) => router.push(`/plan/${id}`)}
          readOnly={!isEditable}
        />
      </YStack>
    </ScreenLayout>
  )
}
