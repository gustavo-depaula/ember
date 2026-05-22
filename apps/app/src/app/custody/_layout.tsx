import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// `new` and `[commitmentId]` use fullScreenModal: slides up like an iOS
// modal (matching the editor's chevron-down close icon) but covers the
// entire screen — no top peek of the previous screen, and Link.AppleZoom's
// morph transition lands cleanly without a gap.

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
      <Stack.Screen name="new" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="[commitmentId]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="session" />
      <Stack.Screen name="shield-pray/[commitmentId]" />
      <Stack.Screen name="pray-to-disable/[commitmentId]" />
    </Stack>
  )
}
