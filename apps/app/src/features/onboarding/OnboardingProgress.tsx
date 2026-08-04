import { useEffect } from 'react'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useTheme, XStack } from 'tamagui'

import { calmSpring } from '@/config/animation'

/** A single dot that springs its width and tweens its fill as state changes. */
function Dot({
  active,
  on,
  onColor,
  offColor,
}: {
  active: boolean
  on: boolean
  onColor: string
  offColor: string
}) {
  const width = useSharedValue(active ? 18 : 6)
  const progress = useSharedValue(on ? 1 : 0)

  useEffect(() => {
    width.value = withSpring(active ? 18 : 6, calmSpring)
  }, [active, width])
  useEffect(() => {
    progress.value = withTiming(on ? 1 : 0, { duration: 200 })
  }, [on, progress])

  const style = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: interpolateColor(progress.value, [0, 1], [offColor, onColor]),
  }))

  return <Animated.View style={[{ height: 6, borderRadius: 3 }, style]} />
}

/**
 * A row of dots. `fill` (default) lights every dot up to the active one — a
 * progress bar; with `fill={false}` only the active dot lights — a carousel
 * position indicator. The active dot is always widened.
 */
export function Dots({
  count,
  activeIndex,
  fill = true,
}: {
  count: number
  activeIndex: number
  fill?: boolean
}) {
  const theme = useTheme()
  const onColor = theme.accent.val
  const offColor = theme.accentSubtle.val

  return (
    <XStack gap="$xs" justifyContent="center" alignItems="center" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => (
        <Dot
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static dots
          key={i}
          active={i === activeIndex}
          on={fill ? i <= activeIndex : i === activeIndex}
          onColor={onColor}
          offColor={offColor}
        />
      ))}
    </XStack>
  )
}

/** Step progress for the onboarding scaffold (1-based step of total). */
export function OnboardingProgress({ index, total }: { index: number; total: number }) {
  return <Dots count={total} activeIndex={index - 1} />
}
