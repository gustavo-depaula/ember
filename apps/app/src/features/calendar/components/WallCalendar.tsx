import { format } from 'date-fns'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { View, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { type DayCalendar, getLiturgicalDayName, rankColors } from '@/lib/liturgical'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'
import { monthWeeks } from './CalendarGrid'

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
const cellHeight = 104

const WallCell = memo(function WallCell({
  day,
  name,
  dotColor,
  isToday,
  isSelected,
  onPress,
}: {
  day: number
  name: string | undefined
  dotColor: string | undefined
  isToday: boolean
  isSelected: boolean
  onPress: (day: number) => void
}) {
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => onPress(day)}
      accessibilityRole="button"
      accessibilityLabel={name ? `${day}, ${name}` : String(day)}
      accessibilityState={{ selected: isSelected }}
      aria-selected={isSelected}
    >
      <YStack
        height={cellHeight}
        padding={8}
        gap={4}
        borderRightWidth={0.5}
        borderBottomWidth={0.5}
        borderColor="$borderColor"
        backgroundColor={isSelected ? '$backgroundHover' : undefined}
      >
        <XStack alignItems="center" gap={6}>
          <Typography fontSize="$3" color={isToday ? '$accent' : '$color'}>
            {day}
          </Typography>
          {dotColor && <View width={6} height={6} borderRadius={3} backgroundColor={dotColor} />}
        </XStack>
        {name && (
          <Typography fontSize={12} lineHeight={15} numberOfLines={4}>
            {name}
          </Typography>
        )}
      </YStack>
    </Pressable>
  )
})

/**
 * The month as a wall calendar, each day ruled off with its celebration written
 * in — the website's month page. For a window with room; a phone keeps the
 * compact `CalendarGrid`.
 */
export function WallCalendar({
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
  const transfers = useOfTransfers()
  const today = useToday()
  const todayDay =
    today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1
  const weeks = useMemo(() => monthWeeks(year, month), [year, month])

  return (
    <YStack borderTopWidth={0.5} borderLeftWidth={0.5} borderColor="$borderColor">
      <XStack>
        {dayKeys.map((key) => (
          <YStack
            key={key}
            flex={1}
            alignItems="center"
            paddingVertical={10}
            borderRightWidth={0.5}
            borderBottomWidth={0.5}
            borderColor="$borderColor"
          >
            <Typography variant="marker" fontSize={10}>
              {t(`calendar.dayLetters.${key}`)}
            </Typography>
          </YStack>
        ))}
      </XStack>
      {weeks.map((week) => (
        <XStack key={`w${week.find((d) => d !== null)}`}>
          {week.map((day, at) => {
            if (!day)
              return (
                <YStack
                  // biome-ignore lint/suspicious/noArrayIndexKey: empty slots have no stable identity
                  key={`e${at}`}
                  flex={1}
                  height={cellHeight}
                  borderRightWidth={0.5}
                  borderBottomWidth={0.5}
                  borderColor="$borderColor"
                />
              )
            const date = new Date(year, month - 1, day)
            const principal = celebrations.get(format(date, 'yyyy-MM-dd'))?.principal
            // Sanctoral names come from the celebration. Temporal ones aren't
            // named in the calendar data: the day name stands in, and names a
            // Sunday that has no celebration of its own.
            const dayName = () =>
              getLiturgicalDayName(date, 'of', { t: (k, o) => t(k, o) as string }, transfers)
            const name = (() => {
              if (principal) return localizeContent(principal.entry.name) || dayName()
              return date.getDay() === 0 ? dayName() : undefined
            })()
            return (
              <WallCell
                key={day}
                day={day}
                name={name}
                dotColor={principal ? (rankColors[principal.rank] ?? '#999') : undefined}
                isToday={day === todayDay}
                isSelected={day === selectedDay}
                onPress={onSelectDay}
              />
            )
          })}
        </XStack>
      ))}
    </YStack>
  )
}
