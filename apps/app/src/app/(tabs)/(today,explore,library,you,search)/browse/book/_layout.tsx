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
        options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
      />
    </Stack>
  )
}
