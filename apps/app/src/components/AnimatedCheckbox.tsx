import { Check } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

import { snappySpring } from '@/config/animation'

const defaultSize = 28
const fillDuration = 180

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

  // The filled/empty look is derived from `checked` *inside* the animated styles
  // rather than held in a hand-driven `progress` shared value: native-screen
  // reattachment under NativeTabs re-initializes shared values to their starting
  // value, so a row that was unchecked when the screen first mounted snapped back
  // to an empty circle after navigating away and back — the row still knew it was
  // done (muted text, no tier dots), only the fill was stranded.
  const pulse = useSharedValue(1)
  const wasChecked = useRef(checked)

  const borderColor = theme.borderColor.val
  const fillColor = subtle ? theme.accentSubtle.val : theme.accent.val
  const bgColor = theme.background.val
  const checkIconSize = Math.round(size * 0.57)

  // Pulse only on a real unchecked -> checked transition, never on mount or
  // reattach. Its resting value is also its initial value, so a reset is a no-op.
  useEffect(() => {
    const justChecked = checked && !wasChecked.current
    wasChecked.current = checked
    if (justChecked) {
      pulse.value = withSequence(withTiming(1.15, { duration: 100 }), withSpring(1, snappySpring))
    }
  }, [checked, pulse])

  const containerStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: subtle ? 1 : 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderColor: withTiming(checked ? fillColor : borderColor, { duration: fillDuration }),
    backgroundColor: withTiming(checked ? fillColor : 'transparent', { duration: fillDuration }),
    transform: [{ scale: pulse.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(checked ? 1 : 0, snappySpring) }],
    opacity: withTiming(checked ? 1 : 0, { duration: fillDuration }),
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
