import { Check } from 'lucide-react-native'
import { useEffect } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

import { snappySpring } from '@/config/animation'

const defaultSize = 28

export function AnimatedCheckbox({
  checked,
  onToggle,
  accessibilityLabel,
  testID,
  size = defaultSize,
  subtle = false,
}: {
  checked: boolean
  onToggle: () => void
  accessibilityLabel: string
  testID?: string
  size?: number
  subtle?: boolean
}) {
  const theme = useTheme()
  const progress = useSharedValue(checked ? 1 : 0)
  const pulse = useSharedValue(1)

  const borderColor = theme.borderColor.val
  const accentColor = theme.accent.val
  const fillColor = subtle ? theme.accentSubtle.val : accentColor
  const bgColor = theme.background.val
  const checkIconSize = Math.round(size * 0.57)

  useEffect(() => {
    if (checked) {
      progress.value = withSpring(1, snappySpring)
      pulse.value = withSequence(withTiming(1.15, { duration: 100 }), withSpring(1, snappySpring))
    } else {
      progress.value = withTiming(0, { duration: 150 })
      pulse.value = 1
    }
  }, [checked, progress, pulse])

  const containerStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: subtle ? 1 : 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderColor: interpolateColor(progress.value, [0, 1], [borderColor, fillColor]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', fillColor]),
    transform: [{ scale: pulse.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: progress.value,
  }))

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View style={containerStyle}>
        <Animated.View style={checkStyle}>
          <Check size={checkIconSize} color={bgColor} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}
