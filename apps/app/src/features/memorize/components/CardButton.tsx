import type { ReactNode } from 'react'
import type { AccessibilityState } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'

// Two visual tiers — primary (filled gold) and secondary (outline). The
// reverent-defaults rule means we keep both calm: no celebratory color
// shifts, no hover-shimmer.
export function CardButton({
  variant,
  label,
  accessibilityLabel,
  accessibilityState,
  onPress,
  children,
}: {
  variant: 'primary' | 'secondary'
  label?: string
  accessibilityLabel: string
  accessibilityState?: AccessibilityState
  onPress: () => void
  children?: ReactNode
}) {
  const bg = variant === 'primary' ? '$accent' : 'transparent'
  const borderColor = variant === 'primary' ? '$accentSubtle' : '$colorSubtle'
  const labelColor = variant === 'primary' ? '$background' : '$color'
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      <YStack
        backgroundColor={bg}
        borderRadius="$md"
        borderWidth={1}
        borderColor={borderColor}
        paddingVertical="$sm"
        paddingHorizontal="$lg"
        alignItems="center"
      >
        {label ? (
          <Text fontFamily="$heading" fontSize="$3" color={labelColor}>
            {label}
          </Text>
        ) : (
          children
        )}
      </YStack>
    </AnimatedPressable>
  )
}
