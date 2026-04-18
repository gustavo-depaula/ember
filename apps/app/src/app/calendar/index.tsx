import { addMonths, subMonths } from 'date-fns'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { useMonthCelebrationMap, useYearCalendar } from '@/features/calendar'
import { CalendarGrid, DayDetail } from '@/features/calendar/components'
import { useToday } from '@/hooks/useToday'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { getCelebrationsForDate } from '@/lib/liturgical'

export default function CalendarScreen() {
  const { t } = useTranslation()
  const now = useToday()
  const [current, setCurrent] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [selectedDay, setSelectedDay] = useState<number | undefined>(
    now.getFullYear() === current.year && now.getMonth() + 1 === current.month
      ? now.getDate()
      : undefined,
  )

  const { data: calendar, isError: calendarError, refetch } = useYearCalendar(current.year)
  const celebrationMap = useMonthCelebrationMap(current.year, current.month)

  const selectedDayCalendar = useMemo(() => {
    if (!selectedDay || !calendar) return undefined
    return getCelebrationsForDate(calendar, new Date(current.year, current.month - 1, selectedDay))
  }, [calendar, current.year, current.month, selectedDay])

  const goToPrev = useCallback(() => {
    const prev = subMonths(new Date(current.year, current.month - 1), 1)
    setCurrent({ year: prev.getFullYear(), month: prev.getMonth() + 1 })
    setSelectedDay(undefined)
  }, [current])

  const goToNext = useCallback(() => {
    const next = addMonths(new Date(current.year, current.month - 1), 1)
    setCurrent({ year: next.getFullYear(), month: next.getMonth() + 1 })
    setSelectedDay(undefined)
  }, [current])

  const monthLabel = formatLocalized(new Date(current.year, current.month - 1), 'MMMM yyyy')

  return (
    <ScreenLayout>
      <YStack gap="$md" paddingVertical="$lg">
        <Text fontFamily="$display" fontSize="$5" color="$accent" textAlign="center">
          {t('calendar.title')}
        </Text>

        <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$md">
          <AnimatedPressable
            onPress={goToPrev}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.prevMonth')}
          >
            <Text fontFamily="$body" fontSize="$3" color="$accent" padding="$sm">
              ‹
            </Text>
          </AnimatedPressable>

          <Text fontFamily="$heading" fontSize="$3" color="$color" textTransform="capitalize">
            {monthLabel}
          </Text>

          <AnimatedPressable
            onPress={goToNext}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.nextMonth')}
          >
            <Text fontFamily="$body" fontSize="$3" color="$accent" padding="$sm">
              ›
            </Text>
          </AnimatedPressable>
        </XStack>

        {calendarError && (
          <XStack
            marginHorizontal="$md"
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$backgroundSurface"
            alignItems="center"
            gap="$sm"
          >
            <Text flex={1} fontFamily="$body" fontSize="$2" color="$colorSecondary">
              {t('calendar.loadError')}
            </Text>
            <AnimatedPressable
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
              hitSlop={8}
            >
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('common.retry')}
              </Text>
            </AnimatedPressable>
          </XStack>
        )}

        <CalendarGrid
          year={current.year}
          month={current.month}
          celebrations={celebrationMap}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        <SectionDivider />

        <DayDetail day={selectedDayCalendar} />
      </YStack>
    </ScreenLayout>
  )
}
