import { BlurView } from 'expo-blur'
import type { ReactNode, RefObject } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'

type Look = { fill: string; opaque: string; rim: string; shadow: string; selected: string }

// `fill` tints the blur; `opaque` stands in where there is nothing to blur.
function look(isDark: boolean): Look {
  return isDark
    ? {
        fill: 'rgba(38,35,32,0.45)',
        opaque: 'rgba(34,31,28,0.88)',
        rim: 'rgba(255,255,255,0.16)',
        shadow: 'rgba(0,0,0,0.45)',
        selected: 'rgba(255,255,255,0.13)',
      }
    : {
        fill: 'rgba(255,253,249,0.55)',
        opaque: 'rgba(248,244,237,0.94)',
        rim: 'rgba(60,45,20,0.1)',
        shadow: 'rgba(60,45,20,0.22)',
        selected: 'rgba(60,45,20,0.1)',
      }
}

export function chromeSelected(isDark: boolean): string {
  return look(isDark).selected
}

/** A floating glass surface. `radius` rounds it; `blurTarget` is what it blurs. */
export function ChromeSurface({
  isDark,
  radius,
  style,
  blurTarget,
  children,
}: {
  isDark: boolean
  radius: number
  style?: StyleProp<ViewStyle>
  blurTarget?: RefObject<View | null>
  children?: ReactNode
}) {
  const l = look(isDark)
  const blurred = blurTarget !== undefined
  return (
    <View
      style={[
        style,
        {
          borderRadius: radius,
          boxShadow: [
            { offsetX: 0, offsetY: 6, blurRadius: 18, spreadDistance: 0, color: l.shadow },
          ],
        },
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        {blurred && (
          <BlurView
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            intensity={70}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: blurred ? l.fill : l.opaque,
              borderRadius: radius,
              borderWidth: 1,
              borderColor: l.rim,
            },
          ]}
        />
      </View>
      {children}
    </View>
  )
}
