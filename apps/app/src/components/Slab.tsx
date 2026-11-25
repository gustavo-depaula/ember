import type { ReactNode } from 'react'
import { YStack } from 'tamagui'

import { lightTap } from '@/lib/haptics'

import { AnimatedPressable } from './AnimatedPressable'
import { Typography } from './typography'

/**
 * A page's one commitment, as the app's gold slab: adopting a rule, an Amen.
 * Dimmed and inert while busy or not yet possible. `children` replaces the
 * tracked-caps label when the moment asks for a larger hand.
 */
export function Slab({
  testID,
  label,
  onPress,
  busy,
  disabled,
  children,
}: {
  testID?: string
  label: string
  onPress: () => void
  busy?: boolean
  disabled?: boolean
  children?: ReactNode
}) {
  const off = busy || disabled
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        if (off) return
        lightTap()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled }}
    >
      <YStack
        backgroundColor="$accent"
        borderRadius="$md"
        padding="$md"
        minHeight={48}
        alignItems="center"
        justifyContent="center"
        opacity={off ? 0.5 : 1}
      >
        {children ?? (
          <Typography variant="label" fontSize="$3" color="$background" textAlign="center">
            {label}
          </Typography>
        )}
      </YStack>
    </AnimatedPressable>
  )
}
