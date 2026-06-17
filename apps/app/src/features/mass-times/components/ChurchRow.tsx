import { ChevronRight, Church } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { useGlassTile } from './glass'

// The shared church row — the polished list cell for the nearby/saved/search lists in the sheet. A
// translucent glass tile, rounded $lg, gold mark, manuscript name, caller detail lines, trailing
// chevron. `onPress` selects the church in place (the sheet's place mode).
export function ChurchRow({
  onPress,
  name,
  children,
}: {
  onPress: () => void
  name: string
  children?: ReactNode
}) {
  const theme = useTheme()
  const tile = useGlassTile()
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={name}>
      <XStack backgroundColor={tile} borderRadius="$lg" padding="$md" gap="$md" alignItems="center">
        <Church size={26} color={theme.accent?.val} />
        <YStack flex={1} gap={2}>
          {/* Natural line-height (no clipping); long names wrap to a second line, the negative margin
              keeps the detail lines tight beneath. */}
          <Typography
            variant="sacred-title"
            textAlign="left"
            fontSize="$4"
            numberOfLines={2}
            marginBottom={-6}
          >
            {name}
          </Typography>
          {children}
        </YStack>
        <ChevronRight size={18} color={theme.colorSecondary?.val} />
      </XStack>
    </AnimatedPressable>
  )
}
