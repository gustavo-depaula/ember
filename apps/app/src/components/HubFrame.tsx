import { createContext, type ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { Animated, ScrollView, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { pageGutter, pageOuterWidth } from '@/lib/layout'

import { PageWidth, useWidthClass } from './pageWidth'
import { useBottomClearance } from './tabAccessory'

const indexWidth = 200
// The website's gap between a hub's index and its list.
const indexGap = 56
// Where the index comes to rest under the tab bar once the title has scrolled away.
const restGap = 16

type Hub = {
  /** Room the index takes at the list's left, its gap included; 0 without one. */
  indexInset: number
  /** The list's own side padding: the gutter, and whatever centres the page in a wider window. */
  side: number
  scrollY: Animated.Value
  setHeaderHeight: (height: number) => void
}

const HubContext = createContext<Hub | undefined>(undefined)

/**
 * A catalogue page, as the website sets one: the title across the top, and
 * beneath it the list with its index down the left side once there is room.
 * The child is the page's own scroller. It spans the window — the system's
 * fade under the bar then runs edge to edge — and takes its padding from
 * `useHubList`; its header goes in a `HubHeader`, which tells the index where
 * to stand. The index rides up with the title, then stays put.
 */
export function HubFrame({ index, children }: { index?: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { expanded } = useWidthClass()
  const bottomClearance = useBottomClearance()
  const scrollY = useRef(new Animated.Value(0)).current
  const [headerHeight, setHeaderHeight] = useState(0)

  const room = width - insets.left - insets.right
  const outer = pageOuterWidth(room, 'wide')
  const showIndex = expanded && !!index
  const indexInset = showIndex ? indexWidth + indexGap : 0
  const side = (room - outer) / 2 + pageGutter

  const hub = useMemo<Hub>(
    () => ({ indexInset, side, scrollY, setHeaderHeight }),
    [indexInset, side, scrollY],
  )

  const top = scrollY.interpolate({
    inputRange: [0, Math.max(1, headerHeight - restGap)],
    outputRange: [insets.top + headerHeight, insets.top + restGap],
    extrapolate: 'clamp',
  })

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingLeft={insets.left}
      paddingRight={insets.right}
    >
      <HubContext.Provider value={hub}>
        <PageWidth width={outer - pageGutter * 2 - indexInset}>{children}</PageWidth>
      </HubContext.Provider>
      {showIndex && headerHeight > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            left: insets.left + side,
            bottom: 0,
            width: indexWidth,
            top,
          }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + bottomClearance + pageGutter }}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
          >
            {index}
          </ScrollView>
        </Animated.View>
      )}
    </YStack>
  )
}

function useHub(): Hub {
  const hub = useContext(HubContext)
  if (!hub) throw new Error('A hub list must stand inside a HubFrame')
  return hub
}

/** What the hub's scroller needs: its side padding, and the scroll the index follows. */
export function useHubList() {
  const { indexInset, side, scrollY } = useHub()
  return useMemo(
    () => ({
      paddingLeft: side + indexInset,
      paddingRight: side,
      onScroll: Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      }),
      scrollEventThrottle: 16,
    }),
    [indexInset, side, scrollY],
  )
}

/** The list's header: it runs the page's full width, over the index's column too. */
export function HubHeader({ children }: { children: ReactNode }) {
  const { indexInset, setHeaderHeight } = useHub()
  return (
    <YStack marginLeft={-indexInset} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
      {children}
    </YStack>
  )
}

/** Whether `HubFrame` is showing its index at this window width. */
export function useHubIndexShown(): boolean {
  return useWidthClass().expanded
}
