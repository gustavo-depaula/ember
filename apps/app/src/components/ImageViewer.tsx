import { Image } from 'expo-image'
import { useCallback, useState } from 'react'
import { Modal, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Gallery } from 'react-native-zoom-toolkit'
import { Text, View, YStack } from 'tamagui'

export type ViewerImage = {
  src: string
  caption?: string
  attribution?: string
}

export function ImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: {
  visible: boolean
  images: ViewerImage[]
  initialIndex?: number
  onClose: () => void
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  const pullY = useSharedValue(0)
  const bgOpacity = useSharedValue(1)

  const dismiss = useCallback(() => {
    onClose()
    setTimeout(() => {
      pullY.value = 0
      bgOpacity.value = 1
      setActiveIndex(initialIndex)
    }, 100)
  }, [onClose, pullY, bgOpacity, initialIndex])

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
  }))

  const activeImage = images[activeIndex] ?? images[0]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, bgStyle]}>
          <View flex={1} backgroundColor="rgba(0,0,0,0.95)">
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { top: insets.top + 12 }]}
              hitSlop={20}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#F5F0E0"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>

            {images.length > 1 && (
              <View style={[styles.pageCounter, { top: insets.top + 18 }]}>
                <Text fontFamily="$body" fontSize={13} color="rgba(245,240,224,0.6)">
                  {activeIndex + 1} / {images.length}
                </Text>
              </View>
            )}

            <Animated.View style={[{ flex: 1 }, contentStyle]}>
              <Gallery
                data={images}
                keyExtractor={(_, i) => String(i)}
                renderItem={(item) => (
                  <Image
                    source={{ uri: item.src }}
                    style={{ width: screenWidth, height: screenHeight }}
                    contentFit="contain"
                  />
                )}
                initialIndex={initialIndex}
                maxScale={4}
                scaleMode="clamp"
                onIndexChange={setActiveIndex}
                onTap={() => dismiss()}
                onVerticalPull={(ty, released) => {
                  'worklet'
                  pullY.value = ty
                  bgOpacity.value = Math.max(0.3, 1 - Math.abs(ty) / 400)
                  if (released && Math.abs(ty) > 120) {
                    runOnJS(dismiss)()
                  }
                }}
              />
            </Animated.View>

            {activeImage && (activeImage.caption || activeImage.attribution) && (
              <YStack
                position="absolute"
                bottom={insets.bottom + 24}
                left={0}
                right={0}
                alignItems="center"
                paddingHorizontal="$lg"
                pointerEvents="none"
              >
                {activeImage.caption && (
                  <Text
                    fontFamily="$body"
                    fontSize="$2"
                    color="rgba(245,240,224,0.8)"
                    textAlign="center"
                    fontStyle="italic"
                  >
                    {activeImage.caption}
                  </Text>
                )}
                {activeImage.attribution && (
                  <Text
                    fontFamily="$body"
                    fontSize={11}
                    color="rgba(245,240,224,0.5)"
                    textAlign="center"
                    marginTop={4}
                  >
                    {activeImage.attribution}
                  </Text>
                )}
              </YStack>
            )}
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCounter: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    pointerEvents: 'none',
  },
})
