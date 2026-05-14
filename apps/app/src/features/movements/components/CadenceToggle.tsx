import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { calmSpring } from '@/config/animation'
import type { Cadence } from '@/db/events'
import { lightTap } from '@/lib/haptics'

const cadences: Cadence[] = ['perpetual', 'goal', 'bounded']
const TRACK_PADDING = 2

export function CadenceToggle({
  value,
  onChange,
}: {
  value: Cadence
  onChange: (cadence: Cadence) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [trackWidth, setTrackWidth] = useState(0)

  const selectedIndex = cadences.indexOf(value)
  const itemWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / cadences.length : 0

  // Slide the accent thumb between positions when the user picks a new cadence.
  // Keep a shared value so the spring updates without re-rendering the parent.
  const thumbX = useSharedValue(selectedIndex * itemWidth + TRACK_PADDING)
  useEffect(() => {
    thumbX.value = withSpring(selectedIndex * itemWidth + TRACK_PADDING, calmSpring)
  }, [selectedIndex, itemWidth, thumbX])

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
    width: itemWidth,
  }))

  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
        {t('movements.cadence.label').toUpperCase()}
      </Text>

      <XStack
        position="relative"
        borderRadius="$md"
        padding={TRACK_PADDING}
        backgroundColor="$backgroundSurface"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        {trackWidth > 0 ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: TRACK_PADDING,
                bottom: TRACK_PADDING,
                backgroundColor: theme.accent?.val,
                borderRadius: 6,
              },
              thumbStyle,
            ]}
          />
        ) : undefined}

        {cadences.map((c) => {
          const selected = c === value
          return (
            <Pressable
              key={c}
              onPress={() => {
                if (!selected) {
                  lightTap()
                  onChange(c)
                }
              }}
              style={{ flex: 1, zIndex: 1 }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(`movements.cadence.${c}`)}
            >
              <YStack alignItems="center" paddingVertical="$sm" borderRadius="$sm">
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color={selected ? 'white' : '$color'}
                  letterSpacing={0.5}
                  textAlign="center"
                >
                  {t(`movements.cadence.${c}`)}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>

      {/* Hint crossfades between cadences so the explanation feels in sync with
          the toggle, not a jarring text-swap. Re-keying on `value` re-mounts
          the Text so FadeIn fires each switch. */}
      <Animated.View key={value} entering={FadeIn.duration(180)}>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
          {t(`movements.cadence.hint.${value}`)}
        </Text>
      </Animated.View>
    </YStack>
  )
}
