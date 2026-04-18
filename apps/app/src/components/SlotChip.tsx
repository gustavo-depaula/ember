import { Check } from 'lucide-react-native'
import { Text, XStack } from 'tamagui'

import { AnimatedPressable } from './AnimatedPressable'

export function SlotChip({
  label,
  active,
  done,
  onToggle,
}: {
  label: string
  active: boolean
  done: boolean
  onToggle: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: done }}
    >
      <XStack
        alignItems="center"
        gap="$xs"
        paddingVertical="$xs"
        paddingHorizontal="$md"
        borderRadius={999}
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        backgroundColor={done ? '$accent' : 'transparent'}
      >
        {done && <Check size={12} color="white" />}
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color={done ? 'white' : active ? '$accent' : '$colorSecondary'}
          letterSpacing={1}
        >
          {label.toUpperCase()}
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}
