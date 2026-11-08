// Full-screen surfaces that push the tab bar away. If the tab bar stays over
// the book reader, its WebView lingers as an invisible touch-intercepting
// overlay and taps go dead app-wide after leaving the book; on the Mass Times
// root map, its own sheet owns the bottom edge.
export const fullScreenRoutes = new Set([
  'pray',
  'redeem',
  'browse/book/[bookId]/read',
  'mass-times/index',
])

/**
 * Whether a route of the tab's stack pushes the tab bar away. A route with a
 * stack of its own is named by that stack ('browse/book') and carries the
 * screen it opens on in its params: the reader opened straight from Today's
 * Continue row arrives as 'browse/book' opening on '[bookId]/read', with no
 * frontispiece beneath for it to rise over as a modal.
 */
export function isFullScreenRoute(route: { name: string; params?: object }): boolean {
  if (fullScreenRoutes.has(route.name)) return true
  const screen = (route.params as { screen?: unknown } | undefined)?.screen
  return typeof screen === 'string' && fullScreenRoutes.has(`${route.name}/${screen}`)
}

// Routes the iOS bar needs no help with: a native modal covers it, and over the
// dark, candle-lit screens its glass takes on their darkness. The Android bar
// is an opaque strip of the theme's paper drawn above every screen in the tab,
// modals included, so it steps aside for these too.
const androidOnlyRoutes = ['browse/book', 'saints/[index]', 'oratio', 'kyrie']

/** Whether the Android tab bar hides for the focused route, as `useSegments()` gives it. */
export function hidesAndroidTabBar(segments: string[]): boolean {
  const path = segments.filter((s) => !s.startsWith('(')).join('/')
  for (const route of [...fullScreenRoutes, ...androidOnlyRoutes]) {
    const base = route.replace(/\/index$/, '')
    if (path === base || path.startsWith(`${base}/`)) return true
  }
  return false
}
