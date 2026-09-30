import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { type EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { useThemeName, View } from 'tamagui'
import { GlassSurface } from '@/components'
import type { SaintEntry } from '../data/catalog'
import { useSaintsCatalog } from '../data/catalog'
import { useSaintsViewStore } from '../store'
import { SaintCard } from './SaintCard'
import { SaintEncounter, SaintEncounterHeader } from './SaintEncounter'

const sheetSpring = { damping: 24, stiffness: 240, mass: 0.9 }
// How much of the sheet peeks above the bottom at rest — handle + the identity
// header (name · feast · patronage).
const peekVisible = 168

// Full-screen swipeable saint viewer. Each page is a card + its own pull-up
// "encounter" sheet, so a lateral swipe slides BOTH together (the sheet moves
// and changes with the card). A single shared value drives the up/down drag
// across every page so the sheet height stays continuous as you page. Closing
// the route just slides this transparentModal away — no native-sheet teardown.
export function SaintCardViewer({
  initialId,
  onClose,
}: {
  initialId: string
  onClose: () => void
}) {
  const { saints, byId } = useSaintsCatalog()
  const orderedIds = useSaintsViewStore((s) => s.orderedIds)
  const isDark = useThemeName().startsWith('dark')
  const { t } = useTranslation()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // The wall publishes its current display order; fall back to calendar order
  // for a cold deep-link straight into the pager.
  const entries = useMemo<SaintEntry[]>(() => {
    const ids = orderedIds.length ? orderedIds : saints.map((s) => s.id)
    return ids.map((id) => byId[id]).filter((e): e is SaintEntry => !!e)
  }, [orderedIds, saints, byId])

  const initialIndex = Math.max(
    0,
    entries.findIndex((e) => e.id === initialId),
  )

  const peekY = screenHeight - peekVisible - insets.bottom
  const openY = Math.round(screenHeight * 0.32)
  const ty = useSharedValue(peekY)

  const renderItem = useCallback(
    ({ item }: { item: SaintEntry }) => (
      <SaintPage
        saint={item}
        isDark={isDark}
        width={screenWidth}
        height={screenHeight}
        insets={insets}
        peekY={peekY}
        openY={openY}
        ty={ty}
        onClose={onClose}
      />
    ),
    [isDark, screenWidth, screenHeight, insets, peekY, openY, ty, onClose],
  )

  const getItemLayout = useCallback(
    (_d: unknown, index: number) => ({ length: screenWidth, offset: screenWidth * index, index }),
    [screenWidth],
  )

  if (entries.length === 0) {
    return <View flex={1} />
  }

  return (
    <View flex={1}>
      <GlassSurface isDark={isDark} isInteractive={false} style={StyleSheet.absoluteFill} />

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={2}
      />

      <Pressable
        onPress={onClose}
        style={[styles.closeButton, { top: insets.top + 12 }]}
        hitSlop={20}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.closeModal')}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M18 6L6 18M6 6l12 12" stroke="#F5F0E0" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Pressable>
    </View>
  )
}

function SaintPage({
  saint,
  isDark,
  width,
  height,
  insets,
  peekY,
  openY,
  ty,
  onClose,
}: {
  saint: SaintEntry
  isDark: boolean
  width: number
  height: number
  insets: EdgeInsets
  peekY: number
  openY: number
  ty: SharedValue<number>
  onClose: () => void
}) {
  const start = useSharedValue(0)

  // Vertical drag on the header raises/lowers the (shared) sheet; fails on
  // horizontal so a lateral swipe pages the list instead.
  const drag = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .failOffsetX([-24, 24])
    .onBegin(() => {
      start.value = ty.value
    })
    .onUpdate((e) => {
      ty.value = Math.min(Math.max(start.value + e.translationY, openY), peekY)
    })
    .onEnd((e) => {
      const midpoint = (openY + peekY) / 2
      const toPeek = e.velocityY > 500 || (e.velocityY > -500 && ty.value > midpoint)
      ty.value = withSpring(toPeek ? peekY : openY, sheetSpring)
    })

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }))

  return (
    <View width={width} height={height}>
      {/* Tapping the backdrop dismisses; the inner Pressable absorbs taps on the
          card so its flip/tilt gestures still work. */}
      <Pressable onPress={onClose} style={[styles.cardArea, { paddingTop: insets.top + 76 }]}>
        <Pressable onPress={() => {}}>
          <SaintCard saint={saint} />
        </Pressable>
      </Pressable>

      <Animated.View style={[styles.sheet, { height }, sheetStyle]} pointerEvents="box-none">
        <GlassSurface isDark={isDark} isInteractive={false} style={styles.sheetSurface}>
          <GestureDetector gesture={drag}>
            <View paddingTop="$sm" paddingBottom="$xs">
              <View
                width={40}
                height={5}
                borderRadius={3}
                backgroundColor="rgba(150,140,120,0.6)"
                alignSelf="center"
                marginBottom="$sm"
              />
              <SaintEncounterHeader saint={saint} />
            </View>
          </GestureDetector>
          <SaintEncounter saint={saint} />
        </GlassSurface>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sheet: {
    position: 'absolute',
    // Inset from the page edges so it reads as a floating panel, not edge-to-edge.
    left: 12,
    right: 12,
    top: 0,
  },
  sheetSurface: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
