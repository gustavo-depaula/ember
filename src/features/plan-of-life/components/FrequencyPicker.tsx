import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { dayLabels } from '@/config/constants'
import type { Frequency } from '@/db/schema'

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
  const frequencies: { value: Frequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Specific Days' },
  ]

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        Frequency
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
                {f.label}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>

      {(frequency === 'weekly' || frequency === 'custom') && (
        <XStack gap="$xs" flexWrap="wrap">
          {dayLabels.map((label, i) => {
            const selected = frequencyDays.includes(i)
            return (
              <Pressable
                key={label}
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
                    {label}
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
