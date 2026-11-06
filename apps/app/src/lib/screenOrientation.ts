import { requireOptionalNativeModule } from 'expo'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'

// Turning the page arrived in a later build than the runtime it ships on, so
// one bundle serves every install: a build without the native module stays
// upright, as its binary was set. Importing expo-screen-orientation there
// would throw at launch.
const orientation = requireOptionalNativeModule('ExpoScreenOrientation')
  ? (require('expo-screen-orientation') as typeof import('expo-screen-orientation'))
  : undefined

/**
 * Lets the screen turn while it is focused, and sets the app upright again as
 * it leaves: the prayer page reads in two columns on its side. The rest of
 * the app stays upright, as the binary starts it (`withPortraitActivity`, the
 * screen-orientation plugin's `initialOrientation`).
 */
export function useTurnsWhileFocused() {
  useFocusEffect(
    useCallback(() => {
      if (!orientation) return
      orientation.unlockAsync()
      return () => {
        orientation.lockAsync(orientation.OrientationLock.PORTRAIT_UP)
      }
    }, []),
  )
}
