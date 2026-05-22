import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

const DURATIONS: number[] = [5, 10, 20, 40, 60]

export function SessionDurationPicker({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (minutes: number) => void
}) {
  const { t } = useTranslation()
  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        Duration
      </Text>
      <XStack gap="$xs" flexWrap="wrap">
        {DURATIONS.map((min) => {
          const selected = value === min
          return (
            <Pressable
              key={min}
              onPress={() => onChange(min)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <YStack
                paddingHorizontal="$md"
                paddingVertical="$xs"
                borderRadius="$md"
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accent' : 'transparent'}
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? 'white' : '$color'}>
                  {t(`custody.session.duration.${min}`)}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}
