import { Text, YStack } from 'tamagui'
import { AnimatedPressable } from '../AnimatedPressable'
import { useLiturgicalColor } from './LiturgicalColorContext'

const COLOR_HEX: Record<string, string> = {
  red: '#C0392B',
  green: '#2D6A4F',
  violet: '#5B2A86',
  black: '#1B1B1B',
}

/**
 * For the `cards` picker style. Selection only — the picked option's body
 * renders below the card stack, not inside the card.
 */
export function OptionCard({
  label,
  excerpt,
  isSelected,
  onPress,
}: {
  label: string
  excerpt?: string
  isSelected: boolean
  onPress: () => void
}) {
  const liturgicalColor = useLiturgicalColor()
  const tint = liturgicalColor && COLOR_HEX[liturgicalColor]
  const selectedBorder = tint ?? '$accent'
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
    >
      <YStack
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderRadius="$md"
        borderWidth={1}
        borderColor={isSelected ? selectedBorder : '$borderColor'}
        backgroundColor={isSelected ? selectedBorder : 'transparent'}
        gap="$xxs"
      >
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={isSelected ? '$background' : '$color'}
          letterSpacing={0.5}
        >
          {label}
        </Text>
        {excerpt && (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color={isSelected ? '$background' : '$colorSecondary'}
            opacity={isSelected ? 0.85 : 1}
            numberOfLines={2}
            fontStyle="italic"
          >
            {excerpt}
          </Text>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
