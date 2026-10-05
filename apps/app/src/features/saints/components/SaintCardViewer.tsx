import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { View } from 'tamagui'
import type { SaintEntry } from '../data/catalog'
import { useSaintsCatalog } from '../data/catalog'
import { useSaintsViewStore } from '../store'
import { SaintPage } from './SaintPage'

// Full-screen swipeable saint viewer. Each page is one card's page (the card,
// then everything the app holds about it), scrolled up and down; a lateral
// swipe moves to the next card in the order the wall is showing.
export function SaintCardViewer({
  initialId,
  onClose,
}: {
  initialId: string
  onClose: () => void
}) {
  const { saints, byId } = useSaintsCatalog()
  const orderedIds = useSaintsViewStore((s) => s.orderedIds)
  const setOrderedIds = useSaintsViewStore((s) => s.setOrderedIds)
  const { t } = useTranslation()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const list = useRef<FlatList<SaintEntry>>(null)

  // The wall publishes its current display order; fall back to calendar order
  // for a link to a card that order doesn't hold (a cold deep link, or one
  // from outside the shelf last shown).
  const entries = useMemo<SaintEntry[]>(() => {
    const ids = orderedIds.includes(initialId) ? orderedIds : saints.map((s) => s.id)
    return ids.map((id) => byId[id]).filter((e): e is SaintEntry => !!e)
  }, [orderedIds, saints, byId, initialId])

  const initialIndex = Math.max(
    0,
    entries.findIndex((e) => e.id === initialId),
  )

  // A related card opens in place: the pager jumps to it. A wall narrowed by a
  // search may not hold it, so the pager falls back to the whole calendar first.
  const [target, setTarget] = useState<string>()
  // A link to another card while the viewer is open changes the route's id, not the list's place.
  const opened = useRef(initialId)
  useEffect(() => {
    if (opened.current === initialId) return
    opened.current = initialId
    setTarget(initialId)
  }, [initialId])
  useEffect(() => {
    if (!target) return
    const index = entries.findIndex((e) => e.id === target)
    if (index < 0) {
      // Already the whole calendar (or the catalog still loading): clearing
      // again would only re-render into this branch forever.
      if (orderedIds.length > 0) setOrderedIds([])
      else if (saints.length > 0) setTarget(undefined)
      return
    }
    list.current?.scrollToIndex({ index, animated: false })
    setTarget(undefined)
  }, [target, entries, orderedIds, saints, setOrderedIds])

  // The page on screen: its card's art downloads ahead of its neighbours'.
  const [current, setCurrent] = useState(initialId)
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const id = viewableItems[0]?.key
    if (id) setCurrent(id)
  }).current

  const renderItem = useCallback(
    ({ item }: { item: SaintEntry }) => (
      <SaintPage
        saint={item}
        width={screenWidth}
        height={screenHeight}
        visible={item.id === current}
        onOpenCard={setTarget}
      />
    ),
    [screenWidth, screenHeight, current],
  )

  const getItemLayout = useCallback(
    (_d: unknown, index: number) => ({ length: screenWidth, offset: screenWidth * index, index }),
    [screenWidth],
  )

  if (entries.length === 0) {
    return <View flex={1} />
  }

  return (
    <View flex={1} backgroundColor="$background">
      <FlatList
        ref={list}
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        // Mounted already at the card: initialScrollIndex alone scrolls there a
        // frame later, and the frame before shows an empty page.
        contentOffset={{ x: screenWidth * initialIndex, y: 0 }}
        getItemLayout={getItemLayout}
        initialNumToRender={1}
        windowSize={3}
        maxToRenderPerBatch={1}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewability}
      />

      <Pressable
        onPress={onClose}
        style={[styles.closeButton, { top: insets.top + 12 }]}
        hitSlop={20}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.closeModal')}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M18 6L6 18M6 6l12 12" stroke="#F5F0E0" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </Pressable>
    </View>
  )
}

const viewability = { itemVisiblePercentThreshold: 60 }

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
