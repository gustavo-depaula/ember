import { Gesture } from 'react-native-gesture-handler'
import { interpolate, runOnJS, useSharedValue, withSpring } from 'react-native-reanimated'
import { snappySpring, tiltSpring } from '@/config/animation'
import { mediumTap } from '@/lib/haptics'

const maxTilt = 15

export function useCardGestures({
  cardWidth,
  cardHeight,
}: {
  cardWidth: number
  cardHeight: number
}) {
  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)
  const isActive = useSharedValue(0)
  const isFlipped = useSharedValue(0)
  const flipRotation = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isActive.value = 1
    })
    .onUpdate((e) => {
      // Map touch position relative to card center to tilt angles
      rotateY.value = interpolate(e.x, [0, cardWidth], [-maxTilt, maxTilt], 'clamp')
      rotateX.value = interpolate(e.y, [0, cardHeight], [maxTilt, -maxTilt], 'clamp')
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, tiltSpring)
      rotateY.value = withSpring(0, tiltSpring)
      isActive.value = 0
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0, tiltSpring)
      rotateY.value = withSpring(0, tiltSpring)
      isActive.value = 0
    })

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(mediumTap)()
      isFlipped.value = isFlipped.value === 0 ? 1 : 0
      flipRotation.value = withSpring(isFlipped.value * 180, snappySpring)
    })

  const composedGesture = Gesture.Race(doubleTapGesture, panGesture)

  return {
    gesture: composedGesture,
    rotateX,
    rotateY,
    isActive,
    flipRotation,
  }
}
