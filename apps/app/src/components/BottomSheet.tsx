import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Modal, Pressable } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, YStack } from 'tamagui'

// The Modal's own animationType slides EVERYTHING together (backdrop + sheet
// rise as one block), which feels wrong on iOS. We drive backdrop opacity and
// sheet translateY independently with Reanimated so the dim fades in while
// the sheet slides up — and reverses cleanly on dismiss.

type Props = {
  visible: boolean
  onClose: () => void
  animation?: 'slide' | 'fade'
  maxHeight?: string | number
  children: ReactNode
}

const BACKDROP_OPACITY = 0.6
const DURATION_IN = 280
const DURATION_OUT = 220

export function BottomSheet({ visible, onClose, animation = 'slide', maxHeight, children }: Props) {
  const insets = useSafeAreaInsets()
  // We keep the modal mounted until the close animation finishes, so the
  // sheet can slide down instead of disappearing instantly. `mounted` tracks
  // whether the Modal is in the tree; `visible` (parent prop) drives the
  // animation direction.
  const [mounted, setMounted] = useState(visible)
  const backdrop = useSharedValue(0)
  const slide = useSharedValue(1) // 1 = off-screen below, 0 = settled

  useEffect(() => {
    if (visible) {
      setMounted(true)
      backdrop.value = withTiming(1, { duration: DURATION_IN, easing: Easing.out(Easing.cubic) })
      slide.value = withTiming(0, { duration: DURATION_IN, easing: Easing.out(Easing.cubic) })
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: DURATION_OUT, easing: Easing.in(Easing.cubic) })
      slide.value = withTiming(
        1,
        { duration: DURATION_OUT, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false)
        },
      )
    }
  }, [visible, mounted, backdrop, slide])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * BACKDROP_OPACITY,
  }))

  const sheetStyle = useAnimatedStyle(() => {
    if (animation === 'fade') {
      return { opacity: 1 - slide.value }
    }
    // Translate from one full sheet-height below into place. Using a large
    // enough constant covers the tallest sheets — Reanimated clips off-screen
    // content automatically.
    return { transform: [{ translateY: slide.value * 800 }] }
  })

  if (!mounted) return null

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'black',
            },
            backdropStyle,
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" />
        </Animated.View>

        <View flex={1} justifyContent="flex-end" pointerEvents="box-none">
          <Animated.View style={sheetStyle}>
            <YStack
              backgroundColor="$background"
              borderTopLeftRadius="$lg"
              borderTopRightRadius="$lg"
              paddingTop="$lg"
              paddingHorizontal="$lg"
              paddingBottom={insets.bottom + 16}
              gap="$md"
              {...(maxHeight !== undefined ? { maxHeight } : {})}
            >
              {children}
            </YStack>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
