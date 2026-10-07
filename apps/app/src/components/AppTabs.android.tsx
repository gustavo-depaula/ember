import { BlurTargetView } from 'expo-blur'
import { useSegments } from 'expo-router'
import { type BottomTabBarProps, Tabs } from 'expo-router/js-tabs'
import { createRef, type RefObject, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Keyboard, Pressable, StyleSheet, type View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeName } from 'tamagui'

import { hidesAndroidTabBar } from '@/lib/fullScreenRoutes'
import { ChromeSurface, chromeSelected } from './chrome'
import { useTabBarCovered } from './tabAccessory'

const todayIcon = require('../../assets/nav-icons/today.png')
const youIcon = require('../../assets/nav-icons/you.png')
const searchIcon = require('../../assets/nav-icons/search.png')

const searchTab = '(search)'

const icons: Record<string, number> = {
  '(today)': todayIcon,
  '(you)': youIcon,
  [searchTab]: searchIcon,
}

// The proportions of the iOS bar: a pill of two wide capsules, and a round
// button as tall as the pill.
const barHeight = 62
const inset = 4
const itemWidth = 88
const iconHeight = 38
const edge = 20

/**
 * The app's three tabs on Android, in the shape of the iOS bar: Today and You
 * in a floating pill, Search in a round button of its own, the screen running
 * on underneath and blurred where it passes behind them.
 */
export function AppTabs() {
  const { t } = useTranslation()
  const labels: Record<string, string> = {
    '(today)': t('nav.today'),
    '(you)': t('nav.you'),
    [searchTab]: t('nav.searchPlaceholder'),
  }
  // Each tab's screen is a blur target; the bar blurs the one in front.
  const targets = useRef(new Map<string, RefObject<View | null>>()).current
  const targetFor = (key: string) => {
    let ref = targets.get(key)
    if (!ref) {
      ref = createRef<View>()
      targets.set(key, ref)
    }
    return ref
  }
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      screenLayout={({ children, route }) => (
        <BlurTargetView ref={targetFor(route.key)} style={styles.fill}>
          {children}
        </BlurTargetView>
      )}
      tabBar={(props) => (
        <FloatingTabBar
          {...props}
          labels={labels}
          blurTarget={targetFor(props.state.routes[props.state.index].key)}
        />
      )}
    >
      <Tabs.Screen name="(today)" options={{ title: labels['(today)'] }} />
      <Tabs.Screen name="(you)" options={{ title: labels['(you)'] }} />
      <Tabs.Screen name={searchTab} options={{ title: labels[searchTab] }} />
    </Tabs>
  )
}

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

function FloatingTabBar({
  state,
  navigation,
  labels,
  blurTarget,
}: BottomTabBarProps & { labels: Record<string, string>; blurTarget: RefObject<View | null> }) {
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const hidden = hidesAndroidTabBar(useSegments())
  const covered = useTabBarCovered()
  // The window resizes for the keyboard, which would carry the bar up with it.
  const keyboardShown = useKeyboardShown()

  if (hidden || covered || keyboardShown) return null

  const bottom = insets.bottom + 10
  const selectedFill = chromeSelected(isDark)

  const tab = (route: (typeof state.routes)[number], round: boolean) => {
    const selected = state.routes[state.index] === route
    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityLabel={labels[route.name]}
        accessibilityState={{ selected }}
        aria-selected={selected}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params)
        }}
        style={[
          styles.item,
          round ? styles.round : styles.capsule,
          selected && { backgroundColor: selectedFill },
        ]}
      >
        <Image source={icons[route.name]} resizeMode="contain" style={styles.icon} />
      </Pressable>
    )
  }

  const search = state.routes.find((r) => r.name === searchTab)

  return (
    <>
      <ChromeSurface
        isDark={isDark}
        radius={barHeight / 2}
        blurTarget={blurTarget}
        style={[styles.pill, { left: edge, bottom }]}
      >
        {state.routes.filter((r) => r.name !== searchTab).map((r) => tab(r, false))}
      </ChromeSurface>
      {search && (
        <ChromeSurface
          isDark={isDark}
          radius={barHeight / 2}
          blurTarget={blurTarget}
          style={[styles.search, { right: edge, bottom }]}
        >
          {tab(search, true)}
        </ChromeSurface>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pill: { position: 'absolute', flexDirection: 'row', height: barHeight, padding: inset },
  search: { position: 'absolute', width: barHeight, height: barHeight, padding: inset },
  item: { alignItems: 'center', justifyContent: 'center', borderRadius: barHeight / 2 },
  capsule: { width: itemWidth, height: barHeight - inset * 2 },
  round: { flex: 1 },
  icon: { height: iconHeight, width: iconHeight * 1.5 },
})
