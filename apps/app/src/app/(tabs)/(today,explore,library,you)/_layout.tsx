import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// Shared array group: the same route files back all four content tabs
// (today/explore/library/you), each with its own independent stack. Detail
// routes (bible, browse, creators, …) therefore stay reachable from whichever
// tab is active while the native tab bar + now-playing accessory remain
// visible (Apple Podcasts pattern). The per-segment anchors below pick each
// tab's root screen; Today keeps `index` so `/` still resolves to it (and the
// existing router.push('/') "go home" calls keep working).
export const unstable_settings = {
  anchor: 'index',
  explore: { anchor: 'explore' },
  library: { anchor: 'library' },
  you: { anchor: 'you' },
}

export default function TabStackLayout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Native push (slide-from-right + parallax + interactive swipe-back).
        // contentStyle paints the background so no white flash peeks mid-slide.
        contentStyle: { backgroundColor: theme.background?.val },
      }}
    />
  )
}
