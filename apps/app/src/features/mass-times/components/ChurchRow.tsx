import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'

// The shared church row for the nearby/saved/search lists in the sheet: no tile, just type on the
// sheet — an optional leading column (the nearby list's time), the name with the distance trailing,
// and the caller's detail lines beneath. Lists separate rows with a Hairline. `onPress` selects the
// church in place (place mode).
export function ChurchRow({
  onPress,
  name,
  leading,
  trailing,
  children,
}: {
  onPress: () => void
  name: string
  leading?: ReactNode
  trailing?: string
  children?: ReactNode
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={name}>
      <XStack paddingVertical={12} gap="$md" alignItems="flex-start">
        {leading}
        <YStack flex={1} gap={2}>
          <XStack alignItems="baseline" gap="$sm">
            <Typography
              variant="sacred-title"
              textAlign="left"
              fontSize={18}
              lineHeight={24}
              numberOfLines={1}
              flex={1}
            >
              {name}
            </Typography>
            {trailing ? <Typography variant="annotation">{trailing}</Typography> : null}
          </XStack>
          {children}
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}
