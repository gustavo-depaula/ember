import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

/**
 * Modal route options for the book reader. Treat as a unit — every flag
 * here is load-bearing for the AppleZoom + swipe-down-dismiss + clean-
 * teardown contract. Dropping any one of them reintroduces a real bug:
 *
 *   - `presentation: 'fullScreenModal'` — required for `Link.AppleZoom`
 *     to morph from the source CTA into the reader's frame.
 *   - `gestureEnabled: true` + `gestureDirection: 'vertical'` — without
 *     `'vertical'`, react-navigation defaults to `'horizontal'` and the
 *     back-edge pop swipe wins instead of the native swipe-down-to-
 *     dismiss.
 *   - `animation: 'default'` — AppleZoom requires the default native
 *     transition. Setting it to `'fade'` / `'none'` breaks the morph AND
 *     leaves a ghost snapshot view sitting over the frontispiece that
 *     swallows taps until app restart.
 *   - `freezeOnBlur: false` — react-native-screens' freezeOnBlur leaves
 *     the frontispiece's RN view tree in a state where hit-testing is
 *     suspended; combined with the AppleZoom teardown it manifests as
 *     "everything except the native tab bar is dead" after dismissal.
 *
 * See `docs/future-plans/book-reader-followups.md` (Tech debt notes).
 */
const READER_MODAL_OPTIONS = {
  presentation: 'fullScreenModal',
  gestureEnabled: true,
  gestureDirection: 'vertical',
  animation: 'default',
  freezeOnBlur: false,
} as const

export default function BookLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      <Stack.Screen name="[bookId]/read" options={READER_MODAL_OPTIONS} />
    </Stack>
  )
}
