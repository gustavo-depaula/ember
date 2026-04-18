import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { dayKeys } from '@/config/constants'

import type { Schedule } from '../schedule'

type ScheduleMode =
  | 'daily'
  | 'days-of-week'
  | 'times-per'
  | 'day-of-month'
  | 'nth-weekday'
  | 'holy-days-of-obligation'

function getMode(schedule: Schedule): ScheduleMode {
  if (schedule.type === 'daily' || schedule.type === 'fixed-program') {
    return 'daily'
  }
  return schedule.type as ScheduleMode
}

export function SchedulePicker({
  schedule,
  onChangeSchedule,
}: {
  schedule: Schedule
  onChangeSchedule: (s: Schedule) => void
}) {
  const { t } = useTranslation()
  const mode = getMode(schedule)

  const modes: { value: ScheduleMode; label: string }[] = [
    { value: 'daily', label: t('frequency.daily') },
    { value: 'days-of-week', label: t('frequency.weekly') },
    { value: 'times-per', label: t('frequency.timesPer', { count: 'X' }) },
    { value: 'day-of-month', label: t('frequency.monthly') },
    { value: 'nth-weekday', label: t('frequency.nthWeekday') },
    { value: 'holy-days-of-obligation', label: t('frequency.holyDays') },
  ]

  function setMode(newMode: ScheduleMode) {
    const seasons = schedule.seasons
    const base = { ...(seasons?.length ? { seasons } : {}) }

    switch (newMode) {
      case 'daily':
        onChangeSchedule({ type: 'daily', ...base })
        break
      case 'days-of-week':
        onChangeSchedule({ type: 'days-of-week', days: [0], ...base })
        break
      case 'times-per':
        onChangeSchedule({ type: 'times-per', count: 3, period: 'week', ...base })
        break
      case 'day-of-month':
        onChangeSchedule({ type: 'day-of-month', days: [1], ...base })
        break
      case 'nth-weekday':
        onChangeSchedule({ type: 'nth-weekday', n: 1, day: 5, ...base })
        break
      case 'holy-days-of-obligation':
        onChangeSchedule({ type: 'holy-days-of-obligation', ...base })
        break
    }
  }

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        {t('frequency.label')}
      </Text>
      <XStack gap="$xs" flexWrap="wrap">
        {modes.map((m) => (
          <Pressable
            key={m.value}
            onPress={() => setMode(m.value)}
            accessibilityRole="radio"
            accessibilityLabel={m.label}
            accessibilityState={{ selected: mode === m.value }}
          >
            <YStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$md"
              borderWidth={1}
              borderColor={mode === m.value ? '$accent' : '$borderColor'}
              backgroundColor={mode === m.value ? '$accent' : 'transparent'}
            >
              <Text fontFamily="$body" fontSize="$2" color={mode === m.value ? 'white' : '$color'}>
                {m.label}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>

      {mode === 'days-of-week' && schedule.type === 'days-of-week' && (
        <DayOfWeekPicker
          days={schedule.days}
          onChangeDays={(days) => onChangeSchedule({ ...schedule, days })}
        />
      )}

      {mode === 'times-per' && schedule.type === 'times-per' && (
        <TimesPerPicker
          count={schedule.count}
          period={schedule.period}
          onChangeCount={(count) => onChangeSchedule({ ...schedule, count })}
          onChangePeriod={(period) => onChangeSchedule({ ...schedule, period })}
        />
      )}

      {mode === 'day-of-month' && schedule.type === 'day-of-month' && (
        <DayOfMonthPicker
          days={schedule.days}
          onChangeDays={(days) => onChangeSchedule({ ...schedule, days })}
        />
      )}

      {mode === 'nth-weekday' && schedule.type === 'nth-weekday' && (
        <NthWeekdayPicker
          n={schedule.n}
          day={schedule.day}
          onChangeN={(n) => onChangeSchedule({ ...schedule, n })}
          onChangeDay={(day) => onChangeSchedule({ ...schedule, day })}
        />
      )}
    </YStack>
  )
}

function DayOfWeekPicker({
  days,
  onChangeDays,
}: {
  days: number[]
  onChangeDays: (days: number[]) => void
}) {
  const { t } = useTranslation()

  return (
    <XStack gap="$xs" flexWrap="wrap">
      {dayKeys.map((key, i) => {
        const selected = days.includes(i)
        const label = t(`day.${key}`)
        return (
          <Pressable
            key={key}
            onPress={() => {
              const next = selected ? days.filter((d) => d !== i) : [...days, i]
              if (next.length > 0) onChangeDays(next)
            }}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
          >
            <YStack
              width={40}
              height={36}
              borderRadius="$sm"
              borderWidth={1}
              borderColor={selected ? '$accent' : '$borderColor'}
              backgroundColor={selected ? '$accent' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontFamily="$body" fontSize="$1" color={selected ? 'white' : '$colorSecondary'}>
                {label}
              </Text>
            </YStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}

function TimesPerPicker({
  count,
  period,
  onChangeCount,
  onChangePeriod,
}: {
  count: number
  period: 'week' | 'month'
  onChangeCount: (n: number) => void
  onChangePeriod: (p: 'week' | 'month') => void
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$xs">
      <XStack gap="$sm" alignItems="center">
        <Pressable
          onPress={() => onChangeCount(Math.max(1, count - 1))}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.decreaseCount')}
        >
          <YStack
            width={32}
            height={32}
            borderRadius="$sm"
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="$body" fontSize="$3" color="$color">
              −
            </Text>
          </YStack>
        </Pressable>
        <Text fontFamily="$body" fontSize="$3" color="$color" minWidth={24} textAlign="center">
          {count}
        </Text>
        <Pressable
          onPress={() => onChangeCount(count + 1)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.increaseCount')}
        >
          <YStack
            width={32}
            height={32}
            borderRadius="$sm"
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="$body" fontSize="$3" color="$color">
              +
            </Text>
          </YStack>
        </Pressable>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {t('frequency.per')}
        </Text>
        {(['week', 'month'] as const).map((p) => {
          const label = t(`frequency.${p}`)
          return (
            <Pressable
              key={p}
              onPress={() => onChangePeriod(p)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected: period === p }}
            >
              <YStack
                paddingHorizontal="$sm"
                paddingVertical="$xs"
                borderRadius="$sm"
                borderWidth={1}
                borderColor={period === p ? '$accent' : '$borderColor'}
                backgroundColor={period === p ? '$accent' : 'transparent'}
              >
                <Text fontFamily="$body" fontSize="$2" color={period === p ? 'white' : '$color'}>
                  {label}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}

function DayOfMonthPicker({
  days,
  onChangeDays,
}: {
  days: number[]
  onChangeDays: (days: number[]) => void
}) {
  const commonDays = [1, 5, 10, 15, 20, 25]

  return (
    <XStack gap="$xs" flexWrap="wrap">
      {commonDays.map((d) => {
        const selected = days.includes(d)
        return (
          <Pressable
            key={d}
            onPress={() => {
              const next = selected ? days.filter((x) => x !== d) : [...days, d]
              if (next.length > 0) onChangeDays(next)
            }}
            accessibilityRole="button"
            accessibilityLabel={String(d)}
            accessibilityState={{ selected }}
          >
            <YStack
              width={40}
              height={36}
              borderRadius="$sm"
              borderWidth={1}
              borderColor={selected ? '$accent' : '$borderColor'}
              backgroundColor={selected ? '$accent' : 'transparent'}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontFamily="$body" fontSize="$1" color={selected ? 'white' : '$colorSecondary'}>
                {d}
              </Text>
            </YStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}

function NthWeekdayPicker({
  n,
  day,
  onChangeN,
  onChangeDay,
}: {
  n: number
  day: number
  onChangeN: (n: number) => void
  onChangeDay: (day: number) => void
}) {
  const { t } = useTranslation()
  const nOptions = [1, 2, 3, 4, -1]

  return (
    <YStack gap="$sm">
      <XStack gap="$xs" flexWrap="wrap">
        {nOptions.map((opt) => {
          const label = opt === -1 ? t('frequency.last') : `${opt}`
          const selected = n === opt
          return (
            <Pressable
              key={opt}
              onPress={() => onChangeN(opt)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
            >
              <YStack
                paddingHorizontal="$md"
                paddingVertical="$xs"
                borderRadius="$sm"
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accent' : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontFamily="$body"
                  fontSize="$1"
                  color={selected ? 'white' : '$colorSecondary'}
                >
                  {label}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
      <XStack gap="$xs" flexWrap="wrap">
        {dayKeys.map((key, i) => {
          const selected = day === i
          const label = t(`day.${key}`)
          return (
            <Pressable
              key={key}
              onPress={() => onChangeDay(i)}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
            >
              <YStack
                width={40}
                height={36}
                borderRadius="$sm"
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accent' : 'transparent'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontFamily="$body"
                  fontSize="$1"
                  color={selected ? 'white' : '$colorSecondary'}
                >
                  {label}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}
