import { Image } from 'expo-image'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, View } from 'tamagui'
import { ZoomLink } from '@/components'
import { type Saint, saints } from '../data/saints'

const gap = 12
const numColumns = 2

function GridItem({
  saint,
  itemWidth,
  index,
  label,
}: {
  saint: Saint
  itemWidth: number
  index: number
  label: string
}) {
  const itemHeight = itemWidth * 1.5

  return (
    <ZoomLink href={{ pathname: '/saints/[index]', params: { index } }}>
      <Pressable style={styles.gridItem} accessibilityRole="link" accessibilityLabel={label}>
        <View
          width={itemWidth}
          height={itemHeight}
          borderRadius="$md"
          overflow="hidden"
          borderWidth={1.5}
          borderColor="$accent"
        >
          <Image source={saint.image} style={styles.image} contentFit="cover" />
          <View
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            paddingVertical={4}
            paddingHorizontal={6}
            backgroundColor="rgba(0,0,0,0.5)"
          >
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="#F5F0E0"
              textAlign="center"
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        </View>
      </Pressable>
    </ZoomLink>
  )
}

export function SaintCardGrid() {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const contentWidth = Math.min(screenWidth - 48, 640)
  const itemWidth = (contentWidth - gap) / numColumns

  const renderItem = useCallback(
    ({ item, index }: { item: Saint; index: number }) => (
      <GridItem saint={item} itemWidth={itemWidth} index={index} label={t(item.nameKey)} />
    ),
    [itemWidth, t],
  )

  const keyExtractor = useCallback((item: Saint) => item.id, [])

  return (
    <FlatList
      style={styles.flex}
      data={saints}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={styles.list}
      columnWrapperStyle={[styles.row, { gap }]}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  // Without flex:1, the FlatList sizes to its full content height (all rows
  // stacked) — the parent YStack overflows ScreenLayout's bounded area and
  // the grid stops scrolling: any row past the first ~2.2 is clipped and
  // unreachable. flex:1 binds the list to the remaining parent height so
  // the inner ScrollView has a finite viewport to scroll within.
  flex: { flex: 1 },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    justifyContent: 'center',
  },
  gridItem: {
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
