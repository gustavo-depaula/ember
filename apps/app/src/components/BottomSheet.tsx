import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
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

// Context surfacing the parent BottomSheet's `settled` state to descendants.
// Children deferring expensive native mounts (e.g. SwiftUI pickers) read this
// via useBottomSheetSettled() to avoid popping in mid-animation.
const BottomSheetSettledContext = createContext(false)
export function useBottomSheetSettled(): boolean {
  return useContext(BottomSheetSettledContext)
}

// The Modal's own animationType slides EVERYTHING together (backdrop + sheet
// rise as one block), which feels wrong on iOS. We drive backdrop opacity and
// sheet translateY independently with Reanimated so the dim fades in while
// the sheet slides up — and reverses cleanly on dismiss.

type Props = {
  visible: boolean
  onClose: () => void
  animation?: 'slide' | 'fade'
  maxHeight?: string | number
  // expand: when true the sheet fills the screen from `insets.top + 8` down,
  // instead of hugging its content. Use for sheets that contain a tall fixed
  // native view (e.g. the iOS FamilyActivityPicker) which would otherwise
  // leave dead space below.
  expand?: boolean
  children: ReactNode
}

const BACKDROP_OPACITY = 0.6
const DURATION_IN = 320
const DURATION_OUT = 220
// Slide offset large enough that any sheet (up to ~95% of an iPhone Pro Max)
// starts fully off-screen. Reanimated clips so over-shooting is free.
const SLIDE_OFFSET = 900

export function BottomSheet({
  visible,
  onClose,
  animation = 'slide',
  maxHeight,
  expand,
  children,
}: Props) {
  const insets = useSafeAreaInsets()
  // We keep the modal mounted until the close animation finishes, so the
  // sheet can slide down instead of disappearing instantly. `mounted` tracks
  // whether the Modal is in the tree; `visible` (parent prop) drives the
  // animation direction.
  const [mounted, setMounted] = useState(visible)
  // `settled` flips true after the entry animation completes. Children can
  // read this via context-less prop drilling (we pass it down) to defer
  // mounting expensive native views (e.g. SwiftUI pickers) so they don't
  // pop in mid-animation.
  const [settled, setSettled] = useState(false)
  const backdrop = useSharedValue(0)
  const slide = useSharedValue(1) // 1 = off-screen below, 0 = settled

  useEffect(() => {
    if (visible) {
      // Reset both values BEFORE flipping mounted so the first render after
      // mount is guaranteed off-screen / transparent. Otherwise on slow JS
      // bridges the React render can race the worklet, producing a one-frame
      // flash mid-screen.
      slide.value = 1
      backdrop.value = 0
      setMounted(true)
      setSettled(false)
      backdrop.value = withTiming(1, { duration: DURATION_IN, easing: Easing.out(Easing.cubic) })
      slide.value = withTiming(
        0,
        { duration: DURATION_IN, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setSettled)(true)
        },
      )
    } else if (mounted) {
      setSettled(false)
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
    return { transform: [{ translateY: slide.value * SLIDE_OFFSET }] }
  })

  if (!mounted) return null

  // Children that need to know whether the sheet has finished entering can
  // read `settled` via React context. Most callers use a simple boolean prop
  // surfaced via `BottomSheetSettledContext` (see useBottomSheetSettled).
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <BottomSheetSettledContext.Provider value={settled}>
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

          {expand ? (
            // Full-height sheet — anchored at top to take all available space
            // below the safe area. flex:1 on the animated wrapper guarantees
            // the inner YStack stretches to the screen bottom.
            <View style={{ flex: 1, marginTop: insets.top + 8 }} pointerEvents="box-none">
              <Animated.View style={[{ flex: 1 }, sheetStyle]}>
                <YStack
                  flex={1}
                  backgroundColor="$background"
                  borderTopLeftRadius={20}
                  borderTopRightRadius={20}
                  paddingTop="$xs"
                  paddingHorizontal="$lg"
                  paddingBottom={insets.bottom + 16}
                  gap="$md"
                >
                  <DragHandle />
                  {children}
                </YStack>
              </Animated.View>
            </View>
          ) : (
            <View flex={1} justifyContent="flex-end" pointerEvents="box-none">
              <Animated.View style={sheetStyle}>
                <YStack
                  backgroundColor="$background"
                  borderTopLeftRadius={20}
                  borderTopRightRadius={20}
                  paddingTop="$xs"
                  paddingHorizontal="$lg"
                  paddingBottom={insets.bottom + 16}
                  gap="$md"
                  {...(maxHeight !== undefined ? { maxHeight } : {})}
                >
                  <DragHandle />
                  {children}
                </YStack>
              </Animated.View>
            </View>
          )}
        </KeyboardAvoidingView>
      </BottomSheetSettledContext.Provider>
    </Modal>
  )
}

function DragHandle() {
  return (
    <View
      alignSelf="center"
      width={36}
      height={4}
      borderRadius={2}
      backgroundColor="$colorSecondary"
      opacity={0.3}
      marginTop="$xs"
      marginBottom="$xs"
    />
  )
}
