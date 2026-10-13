import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

import { GlassBackdropScope } from '@/components/glassBackdrop'
import { TabBarInsets } from '@/components/TabBarInsets'
import { useTabBarOnTop } from '@/components/tabAccessory'
import { fullScreenRoutes } from '@/lib/fullScreenRoutes'

// Shared array group: the same route files back every tab, each with its
// own stack, so detail routes stay reachable from whichever tab is active and
// "back" returns to the tab you opened them from. Today keeps the `index`
// anchor so `/` (router.push('/') "go home") still resolves to it.
export const unstable_settings = {
  anchor: 'index',
  you: { anchor: 'you' },
  search: { anchor: 'search' },
  // The sections an iPad's sidebar adds; a phone never shows these tabs.
  prayers: { anchor: 'prayers' },
  bible: { anchor: 'bible' },
  library: { anchor: 'library' },
  saints: { anchor: 'saints/index' },
  calendar: { anchor: 'calendar/index' },
}

// The native stack hides the tab bar for full-screen routes in step with the
// push/pop and puts the Search tab's field back in the tab bar as the bar
// returns (patches/react-native-screens); toggling NativeTabs' `hidden` from JS
// lands mid-transition instead, flickering the bar.
export default function TabStackLayout() {
  const theme = useTheme()
  const tabBarOnTop = useTabBarOnTop()
  return (
    <Stack
      screenLayout={({ children, route }) => (
        <GlassBackdropScope>
          <TabBarInsets skip={fullScreenRoutes.has(route.name)}>{children}</TabBarInsets>
        </GlassBackdropScope>
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        // iOS fades a scroll view's top edge beneath the bar. Where the bar
        // floats at the top and a page has columns, the fade draws over one
        // column only, as a grey slab beside the others.
        ...(tabBarOnTop ? { scrollEdgeEffects: { top: 'hidden' as const } } : undefined),
        // Paints the background so no white flash peeks mid-slide.
        contentStyle: { backgroundColor: theme.background?.val },
        unstable_nativeProps: { hidesBottomBarWhenPushed: fullScreenRoutes.has(route.name) },
      })}
    />
  )
}
