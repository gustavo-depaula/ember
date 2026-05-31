import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

// The stack opens on `index` (the portfolio + live search); without this it
// defaults to the first declared screen — a param-less practice route that
// renders "Practice not found".
export const unstable_settings = { initialRouteName: 'index' }

// Native stack so the search screen can host the iOS 26 header search bar that
// morphs out of the bottom search tab. The search-local detail routes (practice
// / collection / book) are copies of the shared-group screens; they carry their
// own headers/heroes, so the native header is hidden and the background is
// painted to avoid a white flash mid-slide.
export default function SearchStackLayout() {
  const theme = useTheme()
  const detailOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: theme.background?.val },
  }
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="practices/[manifestId]" options={detailOptions} />
      <Stack.Screen name="browse/[collectionId]" options={detailOptions} />
      <Stack.Screen name="browse/book/[bookId]" options={detailOptions} />
    </Stack>
  )
}
