import { ChevronRight } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { useGlassTile } from './glass'

// The shared church row for the nearby/saved/search lists in the sheet: a translucent glass tile with
// the name (and, when known, the distance) on top and the caller's detail lines beneath. Sized so
// four or five rows fit at the half detent. `onPress` selects the church in place (place mode).
export function ChurchRow({
  onPress,
  name,
  trailing,
  children,
}: {
  onPress: () => void
  name: string
  trailing?: string
  children?: ReactNode
}) {
  const theme = useTheme()
  const tile = useGlassTile()
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={name}>
      <XStack
        backgroundColor={tile}
        borderRadius="$lg"
        paddingVertical="$sm"
        paddingLeft="$md"
        paddingRight="$sm"
        gap="$sm"
        alignItems="center"
      >
        <YStack flex={1} gap={2}>
          <XStack alignItems="baseline" gap="$sm">
            <Typography
              variant="sacred-title"
              textAlign="left"
              fontSize="$3"
              numberOfLines={1}
              flex={1}
            >
              {name}
            </Typography>
            {trailing ? <Typography variant="annotation">{trailing}</Typography> : null}
          </XStack>
          {children}
        </YStack>
        <ChevronRight size={16} color={theme.colorSecondary?.val} />
      </XStack>
    </AnimatedPressable>
  )
}
