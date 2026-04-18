import { ChevronRight } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, FadeInView } from '@/components'

export function ShortcutRow({
  leading,
  title,
  tagline,
  onPress,
}: {
  leading: ReactNode
  title: string
  tagline: string
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <FadeInView>
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={title}
        accessibilityHint={tagline}
      >
        <XStack
          alignItems="center"
          gap="$md"
          paddingVertical="$sm"
          paddingHorizontal="$md"
          borderRadius="$lg"
          backgroundColor="$backgroundSurface"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <YStack width={28} height={48} alignItems="center" justifyContent="center">
            {leading}
          </YStack>
          <YStack flex={1}>
            <Text fontFamily="$heading" fontSize="$3" color="$color" letterSpacing={0.5}>
              {title}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$colorSecondary"
              fontStyle="italic"
              numberOfLines={1}
            >
              {tagline}
            </Text>
          </YStack>
          <ChevronRight size={16} color={theme.accent?.val} />
        </XStack>
      </AnimatedPressable>
    </FadeInView>
  )
}
