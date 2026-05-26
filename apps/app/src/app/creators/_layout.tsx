import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function CreatorsLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      {/* fullScreenModal lets Link.AppleZoom morph the mini-player pill into
          the player screen without a gap above; gestureEnabled keeps the
          iOS 18 zoom-transition swipe-down dismissal active so the screen
          works like a real bottom sheet. */}
      <Stack.Screen
        name="[creatorId]/episode/[itemId]"
        options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
      />
    </Stack>
  )
}
