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

// Full-screen surfaces that push the tab bar away. If the tab bar stays over
// the book reader, its WebView lingers as an invisible touch-intercepting
// overlay and taps go dead app-wide after leaving the book; on the Mass Times
// root map, its own sheet owns the bottom edge. The native stack hides the bar
// in step with the push/pop and puts the Search tab's field back in the tab bar
// afterwards (patches/react-native-screens); toggling NativeTabs' `hidden` from
// JS lands mid-transition instead, flickering the bar.
const fullScreenRoutes = new Set(['pray', 'browse/book/[bookId]/read', 'mass-times/index'])

export default function TabStackLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
        // Paints the background so no white flash peeks mid-slide.
        contentStyle: { backgroundColor: theme.background?.val },
        hidesBottomBarWhenPushed: fullScreenRoutes.has(route.name),
      })}
    />
  )
}
