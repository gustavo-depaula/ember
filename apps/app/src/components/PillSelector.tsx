import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components/AnimatedPressable'
import { selectionTick } from '@/lib/haptics'

export function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$2" color="$color">
        {label}
      </Text>
      <XStack gap="$sm" flexWrap="wrap">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <AnimatedPressable
              key={opt.value}
              onPress={() => {
                selectionTick()
                onChange(opt.value)
              }}
              accessibilityRole="radio"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected }}
            >
              <YStack
                backgroundColor={selected ? '$accent' : '$backgroundSurface'}
                borderRadius="$lg"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                alignItems="center"
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? '$background' : '$color'}>
                  {opt.label}
                </Text>
              </YStack>
            </AnimatedPressable>
          )
        })}
      </XStack>
    </YStack>
  )
}
