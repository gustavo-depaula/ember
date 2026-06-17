import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { ChevronRight, Church } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'

// The shared church row — the polished list cell for the nearby list, search results, and the map's
// tap card. Mirrors the app's PlanCard / archived-row language: a quiet warm surface, rounded $lg, NO
// border, a gold mark to the left, a manuscript name, then caller-provided detail lines, and a
// trailing chevron. `transparent` drops the surface so it can sit on a glass background (the map card).
export function ChurchRow({
  href,
  name,
  transparent,
  children,
}: {
  href: Href
  name: string
  transparent?: boolean
  children?: ReactNode
}) {
  const theme = useTheme()
  return (
    <Link href={href} asChild>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={name}>
        <XStack
          backgroundColor={transparent ? 'transparent' : '$backgroundSurface'}
          borderRadius="$lg"
          padding="$md"
          gap="$md"
          alignItems="center"
        >
          <Church size={26} color={theme.accent?.val} />
          <YStack flex={1} gap={2}>
            {/* Natural line-height (no clipping); long names wrap to a second line rather than
                truncating, and the negative margin keeps the detail lines tight beneath. */}
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
    </Link>
  )
}
