import type { Href } from 'expo-router'
import { Link } from 'expo-router'
import { ChevronRight, Church } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'

// The shared church row — the polished list cell for the nearby/saved lists and search results. A
// quiet warm surface, rounded $lg, gold mark, manuscript name, caller detail lines, trailing chevron.
// Pass `onPress` to select in place (the sheet's place mode) or `href` to navigate (the search page).
export function ChurchRow({
  href,
  onPress,
  name,
  children,
}: {
  href?: Href
  onPress?: () => void
  name: string
  children?: ReactNode
}) {
  const theme = useTheme()
  const row = (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : 'link'}
      accessibilityLabel={name}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
      >
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

  if (onPress || !href) return row
  return (
    <Link href={href} asChild>
      {row}
    </Link>
  )
}
