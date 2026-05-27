import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// Detail routes (bible, browse, creators, …) live in this stack *inside* the
// Home tab, so pushing them keeps the native tab bar + now-playing accessory
// visible (Apple Podcasts pattern). A bare Stack auto-registers every sibling
// route file.
export default function HomeStackLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 200,
        contentStyle: { backgroundColor: theme.background?.val },
      }}
    />
  )
}
