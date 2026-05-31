import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// The book route now has two screens: `index` (the frontispiece — normal
// swipe-back) and `read` (the reader, which owns horizontal swipes and disables
// the root-stack edge gesture itself while mounted). So gestures stay enabled
// here and only the reader turns them off.
export default function BookLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    />
  )
}
