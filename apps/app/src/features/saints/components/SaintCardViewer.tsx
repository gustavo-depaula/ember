import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
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
  // for a cold deep-link straight into the pager.
  const entries = useMemo<SaintEntry[]>(() => {
    const ids = orderedIds.length ? orderedIds : saints.map((s) => s.id)
    return ids.map((id) => byId[id]).filter((e): e is SaintEntry => !!e)
  }, [orderedIds, saints, byId])

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
      setOrderedIds([])
      return
    }
    list.current?.scrollToIndex({ index, animated: false })
    setTarget(undefined)
  }, [target, entries, setOrderedIds])

  const renderItem = useCallback(
    ({ item }: { item: SaintEntry }) => (
      <SaintPage saint={item} width={screenWidth} height={screenHeight} onOpenCard={setTarget} />
    ),
    [screenWidth, screenHeight],
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
        getItemLayout={getItemLayout}
        initialNumToRender={1}
        windowSize={3}
        maxToRenderPerBatch={1}
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
