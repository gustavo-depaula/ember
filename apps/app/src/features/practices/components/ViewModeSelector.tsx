import { useCallback, useEffect, useState } from 'react'
import { type LayoutChangeEvent, Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Text, XStack, YStack } from 'tamagui'

import { calmSpring } from '@/config/animation'

export function ViewModeSelector({
  modes,
  activeId,
  onSelect,
}: {
  modes: { id: string; label: string }[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const [containerWidth, setContainerWidth] = useState(0)
  const segmentWidth = containerWidth / modes.length

  // Local visual state so text color updates instantly, independent of parent re-render
  const [visualActiveId, setVisualActiveId] = useState(activeId)
  useEffect(() => setVisualActiveId(activeId), [activeId])

  const translateX = useSharedValue(0)

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width
      setContainerWidth(width)
      const idx = modes.findIndex((m) => m.id === visualActiveId)
      translateX.value = (width / modes.length) * idx
    },
    [visualActiveId, modes, translateX],
  )

  const handleSelect = useCallback(
    (id: string, index: number) => {
      setVisualActiveId(id)
      translateX.value = withSpring(segmentWidth * index, calmSpring)
      // FIXME: virtualizing the section list would remove the need for this delay
      setTimeout(() => onSelect(id), 200)
    },
    [segmentWidth, onSelect, translateX],
  )

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <XStack
      backgroundColor="$backgroundSurface"
      borderRadius="$md"
      padding={3}
      position="relative"
      onLayout={handleLayout}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 3,
              left: 3,
              bottom: 3,
              width: segmentWidth - 2,
              borderRadius: 8,
            },
            indicatorStyle,
          ]}
        >
          <XStack flex={1} backgroundColor="$accent" borderRadius="$sm" />
        </Animated.View>
      )}

      {modes.map((mode, index) => {
        const active = mode.id === visualActiveId
        return (
          <Pressable
            key={mode.id}
            onPress={() => handleSelect(mode.id, index)}
            style={{ flex: 1, zIndex: 1 }}
          >
            <YStack
              paddingVertical="$xs"
              paddingHorizontal="$sm"
              justifyContent="center"
              alignItems="center"
              flex={1}
            >
              <Text
                fontFamily="$heading"
                fontSize="$1"
                color={active ? '$background' : '$colorSecondary'}
                textAlign="center"
              >
                {mode.label}
              </Text>
            </YStack>
          </Pressable>
        )
      })}
    </XStack>
  )
}
