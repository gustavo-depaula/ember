import { createContext, type ReactNode, useContext, useMemo } from 'react'
import {
  type EdgeInsets,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'

import { topTabBarClearance, useTabBarOnTop } from './tabAccessory'

const WindowInsetsContext = createContext<EdgeInsets | undefined>(undefined)

/**
 * Where the tab bar floats at the top of the window (iPad, Mac), counts it into
 * the top safe-area inset for everything beneath: each screen already keeps
 * clear of `insets.top`, and its header art still bleeds up behind the bar.
 */
export function TabBarInsets({ skip, children }: { skip?: boolean; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const onTop = useTabBarOnTop()
  const padded = useMemo(
    () => (onTop && !skip ? { ...insets, top: insets.top + topTabBarClearance } : insets),
    [insets, onTop, skip],
  )
  return (
    <WindowInsetsContext.Provider value={insets}>
      <SafeAreaInsetsContext.Provider value={padded}>{children}</SafeAreaInsetsContext.Provider>
    </WindowInsetsContext.Provider>
  )
}

/** For a screen that covers the tab bar (a full-screen modal): the window's own insets again. */
export function WindowInsets({ children }: { children: ReactNode }) {
  const insets = useContext(WindowInsetsContext)
  if (!insets) return children
  return <SafeAreaInsetsContext.Provider value={insets}>{children}</SafeAreaInsetsContext.Provider>
}
