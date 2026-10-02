import { useSegments } from 'expo-router'
import type { BottomTabBarProps } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import {
  Image,
  type ImageSourcePropType,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'tamagui'

import { hidesAndroidTabBar } from '@/lib/fullScreenRoutes'

const barHeight = 56
const iconHeight = 32

export type AndroidTab = { icon: ImageSourcePropType; label: string }

function useKeyboardShown(): boolean {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setShown(true))
    const hide = Keyboard.addListener('keyboardDidHide', () => setShown(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])
  return shown
}

/**
 * The tab bar on Android. Material's bottom navigation tints every icon to a
 * flat silhouette, so the illuminated icons are drawn here instead. It lies
 * over the screens the way the iOS bar does, so they reserve the same
 * clearance on both platforms (`useBottomClearance`).
 */
export function AndroidTabBar({
  state,
  navigation,
  tabs,
}: BottomTabBarProps & { tabs: Record<string, AndroidTab> }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const fullScreen = hidesAndroidTabBar(useSegments())
  // The window resizes for the keyboard, which would carry the bar up with it.
  const keyboardShown = useKeyboardShown()

  if (fullScreen || keyboardShown) return null

  return (
    <View
      style={[
        styles.bar,
        {
          height: barHeight + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = tabs[route.name]
        if (!tab) return null
        const selected = state.index === index
        return (
          <Pressable
            key={route.key}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            android_ripple={{ color: theme.accentSubtle.val, borderless: true, radius: 40 }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
              if (!selected && !event.defaultPrevented)
                navigation.navigate(route.name, route.params)
            }}
          >
            <Image
              source={tab.icon}
              resizeMode="contain"
              style={[styles.icon, { opacity: selected ? 1 : 0.45 }]}
            />
            <View
              style={[
                styles.mark,
                { backgroundColor: selected ? theme.accent.val : 'transparent' },
              ]}
            />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  icon: { height: iconHeight, width: iconHeight * 1.5 },
  mark: { width: 18, height: 2, borderRadius: 1 },
})
