import { Image } from 'expo-image'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, View } from 'tamagui'
import { type Saint, saints } from '../data/saints'

const gap = 12
const numColumns = 2

function GridItem({
  saint,
  itemWidth,
  onPress,
  label,
}: {
  saint: Saint
  itemWidth: number
  onPress: () => void
  label: string
}) {
  const itemHeight = itemWidth * 1.5

  return (
    <Pressable onPress={onPress} style={styles.gridItem}>
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
  )
}

export function SaintCardGrid({ onSelectSaint }: { onSelectSaint: (index: number) => void }) {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const contentWidth = Math.min(screenWidth - 48, 640)
  const itemWidth = (contentWidth - gap) / numColumns

  const renderItem = useCallback(
    ({ item, index }: { item: Saint; index: number }) => (
      <GridItem
        saint={item}
        itemWidth={itemWidth}
        onPress={() => onSelectSaint(index)}
        label={t(item.nameKey)}
      />
    ),
    [itemWidth, onSelectSaint, t],
  )

  const keyExtractor = useCallback((item: Saint) => item.id, [])

  return (
    <FlatList
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
