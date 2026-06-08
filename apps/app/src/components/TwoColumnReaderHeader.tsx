import { ChevronDown } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { Typography } from './typography'

type Variant = 'plain' | 'heading'

export function TwoColumnReaderHeader({
  leftLabel,
  rightValue,
  onLeftPress,
  onRightPress,
  leftA11yLabel,
  rightA11yLabel,
  variant = 'plain',
}: {
  leftLabel: string
  rightValue: string
  onLeftPress: () => void
  onRightPress: () => void
  leftA11yLabel: string
  rightA11yLabel: string
  variant?: Variant
}) {
  const theme = useTheme()
  const isHeading = variant === 'heading'

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$sm">
      <Pressable
        onPress={onLeftPress}
        style={isHeading ? { flex: 1, marginRight: 12 } : { flex: 1 }}
        accessibilityRole="button"
        accessibilityLabel={leftA11yLabel}
      >
        <XStack alignItems="center" gap="$xs">
          {isHeading ? (
            <Text fontFamily="$heading" fontSize="$5" color="$color" numberOfLines={1} flex={1}>
              {leftLabel}
            </Text>
          ) : (
            <Typography fontSize="$5" fontWeight="500" numberOfLines={1} flexShrink={1}>
              {leftLabel}
            </Typography>
          )}
          <ChevronDown size={18} color={theme.color.val} />
        </XStack>
      </Pressable>

      <Pressable
        onPress={onRightPress}
        style={isHeading ? undefined : { paddingLeft: 32, paddingVertical: 8 }}
        accessibilityRole="button"
        accessibilityLabel={rightA11yLabel}
      >
        {isHeading ? (
          <Text fontFamily="$heading" fontSize="$5" color="$colorSecondary">
            {rightValue}
          </Text>
        ) : (
          <Typography fontSize="$5" tone="muted">
            {rightValue}
          </Typography>
        )}
      </Pressable>
    </XStack>
  )
}
