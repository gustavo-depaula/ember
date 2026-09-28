import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// Shared array group: the same route files back all three tabs, each with its
// own stack, so detail routes stay reachable from whichever tab is active and
// "back" returns to the tab you opened them from. Today keeps the `index`
// anchor so `/` (router.push('/') "go home") still resolves to it.
export const unstable_settings = {
  anchor: 'index',
  you: { anchor: 'you' },
  search: { anchor: 'search' },
}

export default function TabStackLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Paints the background so no white flash peeks mid-slide.
        contentStyle: { backgroundColor: theme.background?.val },
      }}
    />
  )
}
