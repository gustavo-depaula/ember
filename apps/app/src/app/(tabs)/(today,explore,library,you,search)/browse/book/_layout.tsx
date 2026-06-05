import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// `index` is the frontispiece — standard card push with left-edge swipe back.
// `read` is the reader — presented as a fullScreenModal so Link.AppleZoom can
// morph the "Continue Reading" capsule into the full reading surface and the
// iOS 18+ swipe-down-to-dismiss returns it to the cover. Same pattern as the
// saints viewer and the creator episode player.
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
        options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
      />
    </Stack>
  )
}
