/**
 * Shared liquid-glass surface. iOS 26 devices get a real Liquid Glass
 * background via expo-glass-effect; everywhere else falls back to expo-blur.
 *
 * NOTE: never animate `opacity` on this surface or any of its parents — it
 * kills the glass effect. Animate width/translate on a wrapper and crossfade
 * inner content instead.
 */

import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { type ReactNode, useEffect, useState } from 'react'
import { AccessibilityInfo, Platform, type StyleProp, View, type ViewStyle } from 'react-native'

export const liquidGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

// Respect the OS "Reduce Transparency" accessibility setting: fall back to an
// opaque surface instead of any blur/glass material.
function useReduceTransparency() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceTransparencyEnabled().then((v) => {
      if (mounted) setReduce(v)
    })
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduce)
    return () => {
      mounted = false
      sub.remove()
    }
  }, [])
  return reduce
}

export function GlassSurface({
  isDark,
  style,
  isInteractive = true,
  tintColor,
  children,
}: {
  isDark: boolean
  style: StyleProp<ViewStyle>
  isInteractive?: boolean
  tintColor?: string
  children?: ReactNode
}) {
  const reduceTransparency = useReduceTransparency()

  if (reduceTransparency) {
    return (
      <View style={[style, { backgroundColor: tintColor ?? (isDark ? '#1C1A18' : '#F4F0EA') }]}>
        {children}
      </View>
    )
  }

  if (liquidGlassAvailable) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive={isInteractive}
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={tintColor}
        style={style}
      >
        {children}
      </GlassView>
    )
  }
  // expo-blur on Android falls back to a semi-transparent overlay (no real
  // blur). Acceptable for a floating pill.
  return (
    <BlurView
      tint={isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
      intensity={80}
      style={[style, tintColor ? { backgroundColor: tintColor } : undefined]}
    >
      {children}
    </BlurView>
  )
}
