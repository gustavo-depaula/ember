import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import type { Frequency } from '@/db/schema'

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export function FrequencyPicker({
  frequency,
  frequencyDays,
  onChangeFrequency,
  onChangeDays,
}: {
  frequency: Frequency
  frequencyDays: number[]
  onChangeFrequency: (f: Frequency) => void
  onChangeDays: (days: number[]) => void
}) {
  const { t } = useTranslation()
  const frequencies: { value: Frequency; key: string }[] = [
    { value: 'daily', key: 'frequency.daily' },
    { value: 'weekly', key: 'frequency.weekly' },
    { value: 'custom', key: 'frequency.custom' },
  ]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        {t('frequency.label')}
      </Text>
      <XStack gap="$xs" flexWrap="wrap">
        {frequencies.map((f) => (
          <Pressable key={f.value} onPress={() => onChangeFrequency(f.value)}>
            <YStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$md"
              borderWidth={1}
              borderColor={frequency === f.value ? '$accent' : '$borderColor'}
              backgroundColor={frequency === f.value ? '$accent' : 'transparent'}
            >
              <Text
                fontFamily="$body"
                fontSize="$2"
                color={frequency === f.value ? 'white' : '$color'}
              >
                {t(f.key)}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>

      {(frequency === 'weekly' || frequency === 'custom') && (
        <XStack gap="$xs" flexWrap="wrap">
          {dayKeys.map((key, i) => {
            const selected = frequencyDays.includes(i)
            return (
              <Pressable
                key={key}
                onPress={() => {
                  const next = selected
                    ? frequencyDays.filter((d) => d !== i)
                    : [...frequencyDays, i]
                  onChangeDays(next)
                }}
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
                    fontSize={12}
                    color={selected ? 'white' : '$colorSecondary'}
                  >
                    {t(`day.${key}`)}
                  </Text>
                </YStack>
              </Pressable>
            )
          })}
        </XStack>
      )}
    </YStack>
  )
}
