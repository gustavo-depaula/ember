import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// `read` is a fullScreenModal so Link.AppleZoom can morph the CTA into the
// reader and iOS 18+ swipe-down dismisses it. Same as the saints viewer.
export default function BookLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      <Stack.Screen
        name="[bookId]/read"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: true,
          // Default `gestureDirection` is `horizontal` (the iOS back-edge pop
          // swipe). For a fullScreenModal we want the iOS swipe-down-to-
          // dismiss UIKit ships natively on iOS 13+; the `vertical` direction
          // is what wires that in.
          gestureDirection: 'vertical',
          // AppleZoom requires the default native transition; explicit so
          // future option-edits don't accidentally swap to 'fade' / 'none'
          // and silently break the morph (and, suspected, leave a ghost
          // snapshot view sitting over the frontispiece that swallows taps
          // until app restart).
          animation: 'default',
          // Don't freeze the underlying screen on blur — react-native-screens'
          // freezeOnBlur leaves the frontispiece's RN view tree in a state
          // where hit-testing on the React side is suspended; combined with
          // the AppleZoom morph teardown this manifests as "everything except
          // the native tab bar is dead" after dismissal.
          freezeOnBlur: false,
        }}
      />
    </Stack>
  )
}
