import { Image, type ImageSource } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName, View } from 'tamagui'

import { columnWidth, pageGutter } from '@/lib/layout'

import { usePageWidth } from './pageWidth'
import { useTabBarOnTop } from './tabAccessory'

// Each PNG has transparent padding baked around the art. Overscanning the banner
// past the column width pushes that side padding off-screen so the art itself
// bleeds out the lateral edges; the banner is centered so it overflows evenly.
const overscan = 1.25
// Nudge up so the art's baked-in top padding tucks into the notch.
const topNudge = 12

// Rectangular header banner that bleeds up into the safe-area notch and out to the
// screen edges, with the page title rendered below it in normal flow. Decorative
// only. Distinct from the Today screen's corner flourish, whose shape is a baked-in
// transparent cutout rather than a rectangle.
//
// `light` is optional: until the light-theme art is generated, callers pass only
// `dark` and it serves both themes.
export function PageFlourish({
  dark,
  light,
  aspectRatio,
  lightAspectRatio,
}: {
  dark: ImageSource
  light?: ImageSource
  aspectRatio: number
  lightAspectRatio?: number
}) {
  const insets = useSafeAreaInsets()
  const pageWidth = usePageWidth()
  const tabBarOnTop = useTabBarOnTop()
  const isDark = useThemeName().startsWith('dark')
  const source = isDark ? dark : (light ?? dark)
  const ratio = isDark ? aspectRatio : (lightAspectRatio ?? aspectRatio)

  // Explicit width (not flex-stretch) so the negative side margin can pull the
  // banner clear of ScreenLayout's $lg padding and overscan past the screen edges.
  // The banner tracks the column, gutters included, but never outgrows the
  // reading column: on a phone it bleeds edge to edge, on a wide page it hangs
  // centred.
  const base = Math.min(pageWidth + pageGutter * 2, columnWidth)
  const width = base * overscan
  const marginLeft = (pageWidth - width) / 2

  // The banner is the page's crown on a phone, hung in the notch. An iPad's tab
  // bar floats in that very place, and the two only crowd each other.
  if (tabBarOnTop) return null

  return (
    <View
      width={width}
      marginTop={-insets.top - topNudge}
      marginLeft={marginLeft}
      style={{ pointerEvents: 'none' }}
    >
      <Image
        source={source}
        style={{ width: '100%', aspectRatio: ratio }}
        contentFit="contain"
        accessibilityElementsHidden
      />
    </View>
  )
}
