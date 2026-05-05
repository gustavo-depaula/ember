import type { ReactNode } from 'react'
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
 * Card-shaped tappable option for the `cards` picker style. Used by both
 * OptionsBlock and ChoiceRichTextBlock — title + optional 2-line italic
 * excerpt, prominent border + accent-tinted background when selected.
 *
 * When `children` is provided AND the card is selected, the children
 * render INSIDE the card (replacing the excerpt) — that's the expanded
 * body for the picked option, so the same content doesn't render twice
 * (once as a 2-line teaser, once in full beneath the picker).
 */
export function OptionCard({
  label,
  excerpt,
  isSelected,
  onPress,
  children,
}: {
  label: string
  excerpt?: string
  isSelected: boolean
  onPress: () => void
  children?: ReactNode
}) {
  const showExpandedBody = isSelected && !!children
  // Fall back to the surrounding day's liturgical color for the selected
  // border tint — only saturated colors (red/green/violet/black) tint;
  // pale colors (white/rose/gold) keep the default accent.
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
        {showExpandedBody ? (
          <YStack gap="$sm" marginTop="$xs">
            {children}
          </YStack>
        ) : (
          excerpt && (
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$colorSecondary"
              numberOfLines={2}
              fontStyle="italic"
            >
              {excerpt}
            </Text>
          )
        )}
      </YStack>
    </AnimatedPressable>
  )
}
