import { Image, type ImageSource } from 'expo-image'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName, View } from 'tamagui'

// Matches ScreenLayout's content-column maxWidth so the banner tracks (but never
// exceeds) the column on web/desktop while bleeding edge-to-edge on phones.
const maxWidth = 640
// Mirrors ScreenLayout's paddingHorizontal="$lg" (space.lg = 24). Used as a raw
// number because the negative space token ("$-lg") does not resolve on margins here.
const columnPaddingX = 24
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
  const { width: windowWidth } = useWindowDimensions()
  const isDark = useThemeName().startsWith('dark')
  const source = isDark ? dark : (light ?? dark)
  const ratio = isDark ? aspectRatio : (lightAspectRatio ?? aspectRatio)

  // Explicit width (not flex-stretch) so the negative side margin can pull the
  // banner clear of ScreenLayout's $lg padding and overscan past the screen edges.
  const base = Math.min(windowWidth, maxWidth)
  const width = base * overscan
  // Center the overscanned banner on the column: shift left by half the overflow,
  // then by the column padding so x=0 lands at the screen edge.
  const marginLeft = (base - width) / 2 - columnPaddingX

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
