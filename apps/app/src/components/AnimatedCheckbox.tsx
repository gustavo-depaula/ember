import { Check } from 'lucide-react-native'
import { useEffect, useMemo, useRef } from 'react'
import { Pressable, View } from 'react-native'
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

  // Nothing reanimated computes may carry the checked/unchecked state.
  // `useAnimatedStyle` snapshots its `initial` style on first render only
  // (`if (!animatedUpdaterData.current)`), and that snapshot is the style React
  // commits to the native view — so when a native screen is reattached under
  // NativeTabs and the view is rebuilt from committed props, a row that was
  // unchecked at mount came back with an empty circle however the fill was
  // computed. The plain style below is re-committed by React on every render,
  // so it cannot go stale; reanimated is left holding decoration only.
  const fillColor = subtle ? theme.accentSubtle.val : theme.accent.val
  const boxStyle = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: subtle ? 1 : 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderColor: checked ? fillColor : theme.borderColor.val,
      backgroundColor: checked ? fillColor : 'transparent',
    }),
    [checked, fillColor, size, subtle, theme.borderColor.val],
  )

  // Safe to animate: the pulse rests at 1, which is also the value a stale
  // snapshot or a shared-value reset would land on.
  const pulse = useSharedValue(1)
  const wasChecked = useRef(checked)

  useEffect(() => {
    const justChecked = checked && !wasChecked.current
    wasChecked.current = checked
    if (justChecked) {
      pulse.value = withSequence(withTiming(1.15, { duration: 100 }), withSpring(1, snappySpring))
    }
  }, [checked, pulse])

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="checkbox"
      // `accessibilityState` alone never reaches the DOM — react-native-web drops
      // it, so the web build shipped a checkbox with no checked state for screen
      // readers. `aria-checked` is honoured on both (RN maps aria-* since 0.71).
      accessibilityState={{ checked }}
      aria-checked={checked}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View style={pulseStyle}>
        <View style={boxStyle}>
          {/* Plain, not an `entering` animation: an entering view starts hidden and
              is revealed by the animation, so a run that never starts (reduced
              motion, `skipEntering`, mounting mid-transition) leaves the glyph
              invisible on a checked row — the same failure this component keeps
              having. Nothing that decides whether state is *visible* may depend on
              an animation running. The pulse below is the feedback. */}
          {checked && <Check size={Math.round(size * 0.57)} color={theme.background.val} />}
        </View>
      </Animated.View>
    </Pressable>
  )
}
