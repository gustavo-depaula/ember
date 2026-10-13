import { createContext, type ReactNode, useContext, useMemo } from 'react'
import {
  type EdgeInsets,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { topTabBarInset, useTabBarOnTop } from './tabAccessory'

const sidebarInset = 120

const WindowInsetsContext = createContext<EdgeInsets | undefined>(undefined)

/**
 * Where the tab bar floats at the top of the window (iPad, Mac), makes the top
 * safe-area inset the bar's lower edge for everything beneath: each screen
 * already keeps clear of `insets.top`, and its header art still bleeds up
 * behind the bar.
 */
export function TabBarInsets({ skip, children }: { skip?: boolean; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  // An open sidebar holds the tabs itself: there is no bar across the top then,
  // and the sidebar shows as a left inset no device edge would give.
  const onTop = useTabBarOnTop() && insets.left < sidebarInset
  const underBar = useMemo(
    () => (onTop && !skip ? { ...insets, top: topTabBarInset } : insets),
    [insets, onTop, skip],
  )
  return (
    <WindowInsetsContext.Provider value={insets}>
      <SafeAreaInsetsContext.Provider value={underBar}>{children}</SafeAreaInsetsContext.Provider>
    </WindowInsetsContext.Provider>
  )
}

/** For a screen that covers the tab bar (a full-screen modal): the window's own insets again. */
export function WindowInsets({ children }: { children: ReactNode }) {
  const insets = useContext(WindowInsetsContext)
  if (!insets) return children
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>
}
