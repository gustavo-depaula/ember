import { Text, YStack } from 'tamagui'
import { AnimatedPressable } from '../AnimatedPressable'

/**
 * Card-shaped tappable option for the `cards` picker style. Used by both
 * OptionsBlock and ChoiceRichTextBlock — title + optional 2-line italic
 * excerpt, prominent border + accent-tinted background when selected.
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
        borderColor={isSelected ? '$accent' : '$borderColor'}
        backgroundColor={isSelected ? '$accentSubtle' : 'transparent'}
        gap="$xxs"
      >
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={isSelected ? '$accent' : '$color'}
          letterSpacing={0.5}
        >
          {label}
        </Text>
        {excerpt && (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
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
