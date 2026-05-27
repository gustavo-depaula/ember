import { Stack, useNavigation } from 'expo-router'
import { useEffect } from 'react'
import { useTheme } from 'tamagui'

export default function BookLayout() {
  const theme = useTheme()
  const navigation = useNavigation()

  // The reader WebView handles its own horizontal swipes for chapter
  // navigation; iOS edge-swipe on the root stack still fires and accidentally
  // closes the book. Disable the root-stack gesture only while the book route
  // is mounted, so swipe-back works everywhere else under /browse.
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: walk up the navigator tree
    let root: any = navigation
    while (root?.getParent?.()) root = root.getParent()
    root?.setOptions?.({ gestureEnabled: false })
    return () => {
      root?.setOptions?.({ gestureEnabled: true })
    }
  }, [navigation])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    />
  )
}
