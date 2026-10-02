import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

import { GlassBackdropScope } from '@/components/glassBackdrop'
import { fullScreenRoutes } from '@/lib/fullScreenRoutes'

// Shared array group: the same route files back all three tabs, each with its
// own stack, so detail routes stay reachable from whichever tab is active and
// "back" returns to the tab you opened them from. Today keeps the `index`
// anchor so `/` (router.push('/') "go home") still resolves to it.
export const unstable_settings = {
  anchor: 'index',
  you: { anchor: 'you' },
  search: { anchor: 'search' },
}

// The native stack hides the tab bar for full-screen routes in step with the
// push/pop and puts the Search tab's field back in the tab bar afterwards
// (patches/react-native-screens); toggling NativeTabs' `hidden` from JS lands
// mid-transition instead, flickering the bar.
export default function TabStackLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenLayout={({ children }) => <GlassBackdropScope>{children}</GlassBackdropScope>}
      screenOptions={({ route }) => ({
        headerShown: false,
        // Paints the background so no white flash peeks mid-slide.
        contentStyle: { backgroundColor: theme.background?.val },
        unstable_nativeProps: { hidesBottomBarWhenPushed: fullScreenRoutes.has(route.name) },
      })}
    />
  )
}
