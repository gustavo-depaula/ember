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
      {/* Card viewer; a transparentModal keeps the gallery wall rendered behind
          so the viewer's Glass surfaces frost it (instead of dead black). The
          grid card still zoom-morphs in (Link.AppleZoom). */}
      <Stack.Screen
        name="[index]"
        options={{
          presentation: 'transparentModal',
          gestureEnabled: true,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  )
}
