/**
 * A floating control for over-image heroes: a liquid-glass circle on iOS 26+,
 * with an opaque dark-disc fallback elsewhere. Shared by the collection and
 * practice frontispiece heroes so both read identically. `textShadow` is the
 * companion shadow for cream ink set over the same imagery.
 */

import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { XStack } from 'tamagui'

export const textShadow = {
  textShadowColor: 'rgba(0,0,0,0.6)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 12,
} as const

const circleStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
} as const

export function GlassCircle({
  children,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  disabled,
}: {
  children: ReactNode
  onPress: () => void
  accessibilityLabel: string
  accessibilityRole?: 'button' | 'switch'
  accessibilityState?: { checked?: boolean; busy?: boolean }
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
    >
      {isLiquidGlassAvailable() ? (
        <GlassView glassEffectStyle="regular" isInteractive style={circleStyle}>
          {children}
        </GlassView>
      ) : (
        <XStack {...circleStyle} backgroundColor="rgba(0,0,0,0.4)">
          {children}
        </XStack>
      )}
    </Pressable>
  )
}
