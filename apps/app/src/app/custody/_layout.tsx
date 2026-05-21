import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// `new` and `[commitmentId]` are presented as iOS modals so the editor's
// chevron-down close icon matches the actual gesture (pull-down to dismiss),
// not a push/pop swipe-back. On Android `presentation: 'modal'` falls back
// to a regular push.

export default function CustodyLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[commitmentId]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="session" />
      <Stack.Screen name="shield-pray/[commitmentId]" />
      <Stack.Screen name="pray-to-disable/[commitmentId]" />
    </Stack>
  )
}
