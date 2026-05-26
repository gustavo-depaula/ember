/**
 * Floating liquid-glass bottom navigation: a glass pill with three tabs
 * (Home / New / Library) and a separate glass search circle. Tapping search
 * morphs the layout — the tabs pill collapses to a circle showing the active
 * tab's icon while the search field expands out of the search circle.
 *
 * Purely visual for now: tabs track a local active index and expose optional
 * props so routing can be wired later. The now-playing pill stacks above this.
 */

import { Home, LayoutGrid, Mic, Podcast, Search } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { Text, useTheme, useThemeName } from 'tamagui'

import { calmSpring } from '@/config/animation'

import { GlassSurface } from './GlassSurface'

export const BOTTOM_NAV_HEIGHT = 64

// Float the bar low: sink partway into the home-indicator inset on devices
// that have one, and use a small margin when there's no inset (web).
export function navBarBottom(insetBottom: number) {
  return insetBottom > 0 ? Math.max(insetBottom - 18, 6) : 6
}

const PILL_HEIGHT = BOTTOM_NAV_HEIGHT
const PILL_RADIUS = PILL_HEIGHT / 2
const HORIZONTAL_INSET = 12
const PILL_SPACING = 8
const ICON_SIZE = 26
const SELECTOR_INSET = 6

const tabs = [
  { key: 'home', Icon: Home },
  { key: 'new', Icon: LayoutGrid },
  { key: 'library', Icon: Podcast },
] as const

export function BottomTabBar({
  activeIndex: activeIndexProp,
  onTabPress,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: {
  activeIndex?: number
  onTabPress?: (index: number, key: string) => void
  searchValue?: string
  onSearchChange?: (text: string) => void
  onSearchSubmit?: (text: string) => void
} = {}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const inputRef = useRef<TextInput>(null)

  const [internalActive, setInternalActive] = useState(0)
  const [internalText, setInternalText] = useState('')
  const [open, setOpen] = useState(false)

  const activeIndex = activeIndexProp ?? internalActive
  const text = searchValue ?? internalText
  const ActiveIcon = tabs[activeIndex]?.Icon ?? Home

  const progress = useSharedValue(0)
  const keyboard = useReanimatedKeyboardAnimation()

  const containerW = width - HORIZONTAL_INSET * 2
  const circleW = PILL_HEIGHT
  const wideW = Math.max(containerW - circleW - PILL_SPACING, circleW)

  const labels: Record<string, string> = {
    home: t('nav.home'),
    new: t('nav.new'),
    library: t('nav.library'),
  }

  const highlight = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'

  function openSearch() {
    setOpen(true)
    progress.value = withSpring(1, calmSpring)
  }

  function closeSearch() {
    inputRef.current?.blur()
    setOpen(false)
    progress.value = withSpring(0, calmSpring)
  }

  function pressTab(index: number, key: string) {
    setInternalActive(index)
    onTabPress?.(index, key)
  }

  // Fluid selection pill: springs to the active tab and can be dragged.
  const cellW = (wideW - 8) / 3
  const maxX = (tabs.length - 1) * cellW
  const selectorX = useSharedValue(0)
  const dragStart = useSharedValue(0)

  useEffect(() => {
    selectorX.value = withSpring(activeIndex * cellW, calmSpring)
  }, [activeIndex, cellW, selectorX])

  function selectTab(index: number) {
    const i = Math.min(Math.max(index, 0), tabs.length - 1)
    pressTab(i, tabs[i].key)
  }

  const tabsGesture = Gesture.Race(
    Gesture.Pan()
      .onBegin(() => {
        dragStart.value = selectorX.value
      })
      .onUpdate((e) => {
        selectorX.value = Math.min(Math.max(dragStart.value + e.translationX, 0), maxX)
      })
      .onEnd(() => {
        const i = Math.round(selectorX.value / cellW)
        selectorX.value = withSpring(i * cellW, calmSpring)
        scheduleOnRN(selectTab, i)
      }),
    Gesture.Tap().onEnd((e) => {
      scheduleOnRN(selectTab, Math.floor((e.x - 4) / cellW))
    }),
  )

  const selectorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectorX.value + SELECTOR_INSET }],
  }))

  const liftStyle = useAnimatedStyle(() => {
    // keyboard-controller reports height as a negative value when shown.
    const keyboardHeight = Math.abs(keyboard.height.value)
    const lift = Math.max(keyboardHeight - insets.bottom, 0)
    return { transform: [{ translateY: -lift * progress.value }] }
  })
  const tabsWrapStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [wideW, circleW], Extrapolation.CLAMP),
  }))
  const searchWrapStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [circleW, wideW], Extrapolation.CLAMP),
  }))
  const fadeOut = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
  }))
  const fadeIn = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.55, 1], [0, 1], Extrapolation.CLAMP),
  }))

  // Radius on the glass itself (not just the clip wrapper) avoids a visible
  // square seam inside the rounded pill.
  const glassStyle = {
    flex: 1,
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: PILL_RADIUS,
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: navBarBottom(insets.bottom),
        paddingHorizontal: HORIZONTAL_INSET,
        zIndex: 90,
      }}
    >
      <Animated.View style={[styles.row, liftStyle]}>
        {/* Tabs pill ↔ collapsed active-tab circle */}
        <Animated.View style={[styles.glassWrap, tabsWrapStyle]}>
          <GlassSurface isDark={isDark} style={glassStyle}>
            <Animated.View style={[styles.fill, fadeOut]} pointerEvents={open ? 'none' : 'auto'}>
              <GestureDetector gesture={tabsGesture}>
                <View style={[styles.tabsRow, { width: wideW }]}>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.selector,
                      selectorStyle,
                      { width: cellW - SELECTOR_INSET * 2, backgroundColor: highlight },
                    ]}
                  />
                  {tabs.map(({ key, Icon }, index) => {
                    const isActive = index === activeIndex
                    const tint = isActive ? theme.accent.val : theme.color.val
                    return (
                      <View
                        key={key}
                        pointerEvents="none"
                        style={styles.tabCell}
                        accessible
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={labels[key]}
                      >
                        <Icon size={ICON_SIZE} color={tint} />
                        <Text
                          fontFamily="$body"
                          fontSize={12}
                          color={tint}
                          marginTop={2}
                          letterSpacing={0.2}
                        >
                          {labels[key]}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </GestureDetector>
            </Animated.View>

            <Animated.View
              style={[styles.fill, styles.center, fadeIn]}
              pointerEvents={open ? 'auto' : 'none'}
            >
              <Pressable
                style={styles.circleTap}
                onPress={closeSearch}
                accessibilityRole="button"
                accessibilityLabel={labels[tabs[activeIndex]?.key ?? 'home']}
              >
                <ActiveIcon size={ICON_SIZE} color={theme.accent.val} />
              </Pressable>
            </Animated.View>
          </GlassSurface>
        </Animated.View>

        {/* Search circle ↔ expanded search field */}
        <Animated.View style={[styles.glassWrap, { marginLeft: PILL_SPACING }, searchWrapStyle]}>
          <GlassSurface isDark={isDark} style={glassStyle}>
            <Animated.View
              style={[styles.fill, styles.center, fadeOut]}
              pointerEvents={open ? 'none' : 'auto'}
            >
              <Pressable
                style={styles.circleTap}
                onPress={openSearch}
                accessibilityRole="search"
                accessibilityLabel={t('nav.searchPlaceholder')}
              >
                <Search size={ICON_SIZE} color={theme.color.val} />
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.fill, fadeIn]} pointerEvents={open ? 'auto' : 'none'}>
              <View style={[styles.searchField, { width: wideW }]}>
                <Search size={20} color={theme.colorSecondary.val} />
                <TextInput
                  ref={inputRef}
                  value={text}
                  onChangeText={(v) => {
                    setInternalText(v)
                    onSearchChange?.(v)
                  }}
                  onSubmitEditing={() => onSearchSubmit?.(text)}
                  placeholder={t('nav.searchPlaceholder')}
                  placeholderTextColor={theme.colorSecondary.val}
                  returnKeyType="search"
                  style={[styles.input, { color: theme.color.val }]}
                />
                <Mic size={20} color={theme.colorSecondary.val} />
              </View>
            </Animated.View>
          </GlassSurface>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassWrap: {
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleTap: {
    width: PILL_HEIGHT,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabCell: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selector: {
    position: 'absolute',
    left: 4,
    top: 8,
    bottom: 8,
    borderRadius: 24,
  },
  searchField: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
})
