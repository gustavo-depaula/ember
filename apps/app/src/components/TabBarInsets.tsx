import { createContext, type ReactNode, useContext, useMemo } from 'react'
import { useWindowDimensions, View } from 'react-native'
import {
  type EdgeInsets,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { RoomWidth } from './pageWidth'
import { topTabBarInset, useTabBarOnTop } from './tabAccessory'

const sidebarInset = 120

const WindowInsetsContext = createContext<EdgeInsets | undefined>(undefined)

/**
 * Fits each screen to the room the system tab bar leaves it (iPad, Mac).
 *
 * Under the bar floating at the top, the top safe-area inset becomes the bar's
 * lower edge: each screen already keeps clear of `insets.top`, and its header
 * art still bleeds up behind the bar.
 *
 * Beside an open sidebar, the screen is moved out from under it altogether.
 * The system reports the sidebar as a left inset and lays the screen across
 * the whole window; a page that centres itself, or sizes a hero from the
 * window, would otherwise stand half behind the sidebar.
 */
export function TabBarInsets({ skip, children }: { skip?: boolean; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  // No device edge gives a left inset this deep: it is the sidebar, and with it
  // open there is no bar across the top.
  const beside = useTabBarOnTop() && !skip && insets.left >= sidebarInset
  const underBar = useTabBarOnTop() && !skip && !beside
  const within = useMemo(
    () => ({
      ...insets,
      top: underBar ? topTabBarInset : insets.top,
      left: beside ? 0 : insets.left,
    }),
    [insets, underBar, beside],
  )
  return (
    <WindowInsetsContext.Provider value={insets}>
      <SafeAreaInsetsContext.Provider value={within}>
        {beside ? (
          <View style={{ flex: 1, paddingLeft: insets.left }}>
            <RoomWidth width={width - insets.left - insets.right}>{children}</RoomWidth>
          </View>
        ) : (
          children
        )}
      </SafeAreaInsetsContext.Provider>
    </WindowInsetsContext.Provider>
  )
}

/** For a screen that covers the tab bar (a full-screen modal): the window's own insets again. */
export function WindowInsets({ children }: { children: ReactNode }) {
  const insets = useContext(WindowInsetsContext)
  if (!insets) return children
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>
}
