import { Check } from 'lucide-react-native'
import { useEffect, useMemo, useRef } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme } from 'tamagui'

import { snappySpring } from '@/config/animation'

const defaultSize = 28
// Front-loaded like the spring it replaces: colours can't spring (overshoot
// clamps), but an eased-out timing reads as the same instant response.
const fillTiming = { duration: 140, easing: Easing.out(Easing.quad) }

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

  // Three styles, deliberately: an animated style that both reads a shared value
  // and returns an animation re-runs its worklet every frame, and `styleUpdater`
  // then re-pushes the whole non-animated half of that style *without* its
  // shallow-equal guard. Sharing one style meant the box metrics — width, height,
  // borderWidth — were committed to the shadow tree on every frame of the pulse,
  // forcing a layout pass each time on top of the colour animation's own commits.
  // Split up, no layout prop ever travels through a worklet.
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))

  const fillStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(checked ? fillColor : borderColor, fillTiming),
    backgroundColor: withTiming(checked ? fillColor : 'transparent', fillTiming),
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(checked ? 1 : 0, snappySpring) }],
    opacity: withTiming(checked ? 1 : 0, fillTiming),
  }))

  const boxStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: subtle ? 1 : 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }),
    [size, subtle],
  )

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View style={pulseStyle}>
        <Animated.View style={[boxStyle, fillStyle]}>
          <Animated.View style={checkStyle}>
            <Check size={checkIconSize} color={bgColor} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}
