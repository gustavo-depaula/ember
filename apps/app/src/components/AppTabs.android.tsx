import {
  FilledTonalIconButton,
  HorizontalFloatingToolbar,
  Host,
  IconButton,
  Image,
  Shape,
  Surface,
} from '@expo/ui/jetpack-compose'
import { size } from '@expo/ui/jetpack-compose/modifiers'
import { useSegments } from 'expo-router'
import { type BottomTabBarProps, Tabs } from 'expo-router/js-tabs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName } from 'tamagui'

import { hidesAndroidTabBar } from '@/lib/fullScreenRoutes'

const todayIcon = require('../../assets/nav-icons/today.png')
const youIcon = require('../../assets/nav-icons/you.png')
const searchIcon = require('../../assets/nav-icons/search.png')

const searchTab = '(search)'

/**
 * The app's three tabs on Android, in the shape of the iOS bar: Today and You
 * in a floating pill, Search in a round button of its own, the screen running
 * on underneath. Both are drawn by Material's own components; a Material
 * navigation bar would tint the illuminated icons to flat silhouettes.
 */
export function AppTabs() {
  const { t } = useTranslation()
  const labels: Record<string, string> = {
    '(today)': t('nav.today'),
    '(you)': t('nav.you'),
    [searchTab]: t('nav.searchPlaceholder'),
  }
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} labels={labels} />}
    >
      <Tabs.Screen name="(today)" options={{ title: labels['(today)'] }} />
      <Tabs.Screen name="(you)" options={{ title: labels['(you)'] }} />
      <Tabs.Screen name={searchTab} options={{ title: labels[searchTab] }} />
    </Tabs>
  )
}

const icons: Record<string, number> = {
  '(today)': todayIcon,
  '(you)': youIcon,
  [searchTab]: searchIcon,
}

// The art is drawn for about 32dp of height; the button around it is the
// Material touch target, wide enough to read as a capsule when selected.
const iconSize = size(40, 32)
const buttonSize = size(72, 48)
const searchSize = size(64, 64)
const edge = 16
const elevation = 6

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
}: BottomTabBarProps & { labels: Record<string, string> }) {
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const hidden = hidesAndroidTabBar(useSegments())
  // The window resizes for the keyboard, which would carry the bar up with it.
  const keyboardShown = useKeyboardShown()

  if (hidden || keyboardShown) return null

  const surface = theme.backgroundSurface.val
  const highlight = isDark ? '#FFFFFF24' : '#0000001A'
  const bottom = insets.bottom + 8

  const press = (route: (typeof state.routes)[number], selected: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
    if (!selected && !event.defaultPrevented) navigation.navigate(route.name, route.params)
  }
  const icon = (name: string) => (
    <Image
      source={icons[name]}
      contentScale="fit"
      contentDescription={labels[name]}
      modifiers={[iconSize]}
    />
  )

  const search = state.routes.find((r) => r.name === searchTab)
  const searchSelected = search !== undefined && state.routes[state.index] === search

  return (
    <>
      <Host
        matchContents
        colorScheme={isDark ? 'dark' : 'light'}
        style={[styles.floating, { left: edge, bottom }]}
      >
        {/* The surface carries the colour and the shadow: the toolbar alone
            casts none, and paper on paper would vanish in the light theme. */}
        <Surface color={surface} shape={Shape.Pill({})} shadowElevation={elevation}>
          <HorizontalFloatingToolbar colors={{ toolbarContainerColor: 'transparent' }}>
            {state.routes.map((route, index) => {
              if (route.name === searchTab) return null
              const selected = state.index === index
              const Button = selected ? FilledTonalIconButton : IconButton
              return (
                <Button
                  key={route.key}
                  onClick={() => press(route, selected)}
                  shape={Shape.Pill({})}
                  colors={{ containerColor: selected ? highlight : 'transparent' }}
                  modifiers={[buttonSize]}
                >
                  {icon(route.name)}
                </Button>
              )
            })}
          </HorizontalFloatingToolbar>
        </Surface>
      </Host>

      {search && (
        <Host
          matchContents
          colorScheme={isDark ? 'dark' : 'light'}
          style={[styles.floating, { right: edge, bottom }]}
        >
          {/* A surface rather than Material's floating action button, whose
              shape is a rounded square and cannot be changed. */}
          <Surface
            color={searchSelected ? theme.accentSubtle.val : surface}
            // A pill as tall as it is wide: `Shape.Circle` wants a radius.
            shape={Shape.Pill({})}
            shadowElevation={elevation}
          >
            <IconButton onClick={() => press(search, searchSelected)} modifiers={[searchSize]}>
              {icon(searchTab)}
            </IconButton>
          </Surface>
        </Host>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  floating: { position: 'absolute' },
})
