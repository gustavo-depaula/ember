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
