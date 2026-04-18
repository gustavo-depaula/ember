import { format } from 'date-fns'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View, XStack, YStack } from 'tamagui'
import { AnimatedPressable } from '@/components'
import { useToday } from '@/hooks/useToday'
import { type DayCalendar, rankColors } from '@/lib/liturgical'

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

const DayCell = memo(function DayCell({
  day,
  celebration,
  isToday,
  isSelected,
  onPress,
}: {
  day: number
  celebration: DayCalendar | undefined
  isToday: boolean
  isSelected: boolean
  onPress: (day: number) => void
}) {
  const dotColor = celebration?.principal
    ? (rankColors[celebration.principal.rank] ?? '#999')
    : undefined

  const handlePress = useCallback(() => onPress(day), [day, onPress])

  return (
    <AnimatedPressable onPress={handlePress}>
      <YStack
        width={40}
        height={44}
        alignItems="center"
        justifyContent="center"
        borderRadius={8}
        backgroundColor={isSelected ? '$accent' : undefined}
      >
        <Text
          fontFamily="$body"
          fontSize="$2"
          color={isSelected ? '$background' : isToday ? '$accent' : '$color'}
          fontWeight={isToday ? '700' : '400'}
        >
          {day}
        </Text>
        {dotColor && (
          <View
            width={5}
            height={5}
            borderRadius={3}
            backgroundColor={isSelected ? '$background' : dotColor}
            marginTop={2}
          />
        )}
      </YStack>
    </AnimatedPressable>
  )
})

export function CalendarGrid({
  year,
  month,
  celebrations,
  selectedDay,
  onSelectDay,
}: {
  year: number
  month: number
  celebrations: Map<string, DayCalendar>
  selectedDay: number | undefined
  onSelectDay: (day: number) => void
}) {
  const { t } = useTranslation()
  const today = useToday()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const todayDay = isCurrentMonth ? today.getDate() : -1

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const rows: (number | null)[][] = []
    let row: (number | null)[] = Array(firstDay).fill(null)

    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d)
      if (row.length === 7) {
        rows.push(row)
        row = []
      }
    }
    if (row.length > 0) {
      while (row.length < 7) row.push(null)
      rows.push(row)
    }
    return rows
  }, [year, month])

  const getCelebration = useCallback(
    (day: number) => {
      const key = format(new Date(year, month - 1, day), 'yyyy-MM-dd')
      return celebrations.get(key)
    },
    [celebrations, year, month],
  )

  return (
    <YStack gap={2}>
      <XStack justifyContent="space-around" paddingBottom="$xs">
        {dayKeys.map((key) => (
          <View key={key} width={40} alignItems="center">
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t(`calendar.dayLetters.${key}`)}
            </Text>
          </View>
        ))}
      </XStack>

      {weeks.map((week) => {
        const weekKey = week.find((d) => d !== null) ?? 0
        return (
          <XStack key={`w${weekKey}`} justifyContent="space-around">
            {week.map((day, di) =>
              day ? (
                <DayCell
                  key={day}
                  day={day}
                  celebration={getCelebration(day)}
                  isToday={day === todayDay}
                  isSelected={day === selectedDay}
                  onPress={onSelectDay}
                />
              ) : (
                // biome-ignore lint/suspicious/noArrayIndexKey: empty slots have no stable identity
                <View key={`e${weekKey}-${di}`} width={40} height={44} />
              ),
            )}
          </XStack>
        )
      })}
    </YStack>
  )
}
