import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Text, View } from 'tamagui'
import { type Saint, saints } from '../data/saints'
import { SaintCard } from './SaintCard'

// Full-screen swipeable saint-card pager. Rendered as its own route
// (saints/[index]) presented as a fullScreenModal, so tapping a grid card
// morphs (Link.AppleZoom) into the card. `onClose` pops the route.
export function SaintCardViewer({
  initialIndex,
  onClose,
}: {
  initialIndex: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)

  const renderItem = useCallback(
    ({ item }: { item: Saint }) => (
      <Pressable
        style={{
          width: screenWidth,
          height: screenHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onClose}
        aria-hidden
      >
        <Pressable aria-hidden>
          <SaintCard saint={item} />
        </Pressable>
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="rgba(245, 240, 224, 0.5)"
          textAlign="center"
          marginTop="$md"
        >
          {t('saints.doubleTapToFlip')}
        </Text>
      </Pressable>
    ),
    [screenWidth, screenHeight, onClose, t],
  )

  const keyExtractor = useCallback((item: Saint) => item.id, [])

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  )

  return (
    <View flex={1} backgroundColor="#000">
      {/* Close button */}
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

      <FlatList
        ref={flatListRef}
        data={saints}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        windowSize={5}
        maxToRenderPerBatch={3}
      />
    </View>
  )
}

const styles = StyleSheet.create({
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
