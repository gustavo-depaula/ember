import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function SaintsLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    >
      {/* Full-cover card viewer; fullScreenModal lets the grid card zoom-morph
          in (Link.AppleZoom) and keeps swipe-down-to-dismiss. */}
      <Stack.Screen
        name="[index]"
        options={{ presentation: 'fullScreenModal', gestureEnabled: true }}
      />
    </Stack>
  )
}
