import { Gesture } from 'react-native-gesture-handler'
import { interpolate, runOnJS, useSharedValue, withSpring } from 'react-native-reanimated'
import { snappySpring, tiltSpring } from '@/config/animation'
import { mediumTap } from '@/lib/haptics'

const maxTilt = 15

export function useCardGestures({
  cardWidth,
  cardHeight,
  onFlick,
}: {
  cardWidth: number
  cardHeight: number
  /** A worklet run when the turned card is flicked sideways; its argument is the direction (±1). */
  onFlick?: (direction: number) => void
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
    .onEnd((e) => {
      const flicked = Math.abs(e.translationX) > cardWidth * 0.3 || Math.abs(e.velocityX) > 900
      if (onFlick && isFlipped.value === 1 && flicked) onFlick(Math.sign(e.translationX) || 1)
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
