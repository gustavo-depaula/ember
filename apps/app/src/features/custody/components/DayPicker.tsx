import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import type { Schedule } from '../types'
import { scheduleFromDays, selectedDays, WEEK_LABELS, WEEK_NAMES, WEEK_ORDER } from '../weekDays'

export function DayPicker({
  schedule,
  onChange,
}: {
  schedule: Schedule
  onChange: (next: Schedule) => void
}) {
  const { t } = useTranslation()
  const days = selectedDays(schedule)
  const toggle = (day: number) => {
    const set = new Set(days)
    if (set.has(day)) set.delete(day)
    else set.add(day)
    onChange(scheduleFromDays([...set].sort(), schedule))
  }

  return (
    <YStack gap="$xs">
      <Text
        fontFamily="$body"
        fontSize="$1"
        color="$colorSecondary"
        letterSpacing={1.5}
        textTransform="uppercase"
      >
        {t('custody.editor.section.daysOf')}
      </Text>
      <XStack gap="$xs" justifyContent="space-between">
        {WEEK_ORDER.map((day, idx) => {
          const selected = days.includes(day)
          return (
            <Pressable
              key={day}
              onPress={() => toggle(day)}
              accessibilityRole="button"
              accessibilityLabel={t('custody.editor.a11y.dayToggle', { day: WEEK_NAMES[day] })}
              accessibilityState={{ selected }}
              hitSlop={6}
            >
              <View
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={selected ? '$accent' : 'transparent'}
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color={selected ? '#0E0D0C' : '$colorSecondary'}
                >
                  {WEEK_LABELS[idx]}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}
