import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { ChevronRight, Church } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'

// The shared church row — the polished list cell for the nearby list and search results. Mirrors the
// app's PlanCard / archived-row language: a quiet warm surface, rounded $lg, NO border, a gold mark
// to the left, a manuscript name, then caller-provided detail lines, and a trailing chevron.
export function ChurchRow({
  href,
  name,
  children,
}: {
  href: Href
  name: string
  children?: ReactNode
}) {
  const theme = useTheme()
  return (
    <Link href={href} asChild>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={name}>
        <XStack
          backgroundColor="$backgroundSurface"
          borderRadius="$lg"
          padding="$md"
          gap="$md"
          alignItems="center"
        >
          <Church size={24} color={theme.accent?.val} />
          <YStack flex={1} gap="$xs">
            <Typography variant="sacred-title" textAlign="left" fontSize="$5" numberOfLines={1}>
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
