import { BlurView } from 'expo-blur'
import type { ReactNode, RefObject } from 'react'
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native'
import { create } from 'zustand'

// PROTOTYPE: the candidate looks for floating chrome on Android, switched at
// runtime so they can be compared on a device.
export type ChromeVariant = 'glass' | 'glass-single' | 'smoke' | 'vellum'
export const chromeVariants: ChromeVariant[] = ['glass', 'glass-single', 'smoke', 'vellum']
export const useChromeVariant = create<{ variant: ChromeVariant }>(() => ({ variant: 'glass' }))
export function cycleChromeVariant() {
  const i = chromeVariants.indexOf(useChromeVariant.getState().variant)
  useChromeVariant.setState({ variant: chromeVariants[(i + 1) % chromeVariants.length] })
}

type Look = { fill: string; rim: string; shadow: string; selected: string }

function look(variant: ChromeVariant, isDark: boolean): Look {
  if (variant === 'smoke') {
    return isDark
      ? {
          fill: 'rgba(34,31,28,0.88)',
          rim: 'rgba(255,255,255,0.12)',
          shadow: 'rgba(0,0,0,0.5)',
          selected: 'rgba(255,255,255,0.12)',
        }
      : {
          fill: 'rgba(248,244,237,0.94)',
          rim: 'rgba(60,45,20,0.08)',
          shadow: 'rgba(60,45,20,0.22)',
          selected: 'rgba(60,45,20,0.09)',
        }
  }
  if (variant === 'vellum') {
    return isDark
      ? {
          fill: '#2A2622',
          rim: 'rgba(0,0,0,0)',
          shadow: 'rgba(0,0,0,0.55)',
          selected: 'rgba(212,166,58,0.18)',
        }
      : {
          fill: '#F4ECDC',
          rim: 'rgba(0,0,0,0)',
          shadow: 'rgba(60,45,20,0.28)',
          selected: 'rgba(168,135,46,0.2)',
        }
  }
  return isDark
    ? {
        fill: 'rgba(38,35,32,0.45)',
        rim: 'rgba(255,255,255,0.16)',
        shadow: 'rgba(0,0,0,0.45)',
        selected: 'rgba(255,255,255,0.13)',
      }
    : {
        fill: 'rgba(255,253,249,0.55)',
        rim: 'rgba(60,45,20,0.1)',
        shadow: 'rgba(60,45,20,0.22)',
        selected: 'rgba(60,45,20,0.1)',
      }
}

export function chromeSelected(variant: ChromeVariant, isDark: boolean): string {
  return look(variant, isDark).selected
}

/** A floating surface in the chosen look. `radius` rounds it; `blurTarget` is what glass blurs. */
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
  const variant = useChromeVariant((s) => s.variant)
  const l = look(variant, isDark)
  const glass = variant === 'glass' || variant === 'glass-single'
  const blurred = glass && blurTarget !== undefined
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
              backgroundColor:
                variant === 'glass' && !blurred ? look('smoke', isDark).fill : l.fill,
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
