// biome-ignore-all lint/suspicious/noArrayIndexKey: static gallery items and dot indicators
import type { BilingualText } from '@ember/content-engine'
import { Image } from 'expo-image'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, type LayoutChangeEvent, Pressable, StyleSheet } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { useImageViewer } from '@/components/ImageViewerContext'

type GalleryItem = {
  src: string
  title?: BilingualText
  attribution?: BilingualText
  caption?: BilingualText
}

const peekWidth = 24
const itemGap = 10

export function GalleryBlock({ items }: { items: GalleryItem[] }) {
  const { t } = useTranslation()
  const [containerWidth, setContainerWidth] = useState(0)
  const imageWidth = containerWidth > 0 ? containerWidth - peekWidth - itemGap : 0
  const imageHeight = imageWidth * 1.3
  const [activeIndex, setActiveIndex] = useState(0)
  const { openViewer } = useImageViewer()

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  const handleImagePress = useCallback(
    (index: number) => {
      openViewer(
        items.map((item) => ({
          src: item.src,
          caption: item.caption?.primary,
          attribution: item.attribution?.primary,
        })),
        index,
      )
    },
    [openViewer, items],
  )

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (imageWidth <= 0) return
      const index = Math.round(e.nativeEvent.contentOffset.x / (imageWidth + itemGap))
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)))
    },
    [imageWidth, items.length],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => (
      <YStack width={imageWidth} marginRight={itemGap} alignItems="center" gap="$xs">
        <Pressable
          onPress={() => handleImagePress(index)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.viewGalleryImage', {
            index: index + 1,
            total: items.length,
          })}
        >
          <Image
            source={{ uri: item.src }}
            style={[styles.image, { width: imageWidth, height: imageHeight }]}
            contentFit="cover"
          />
        </Pressable>
        {item.title && (
          <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
            {item.title.primary}
          </Text>
        )}
        {item.attribution && (
          <Text fontFamily="$body" fontSize="$1" color="$colorMuted" textAlign="center">
            {item.attribution.primary}
          </Text>
        )}
        {item.caption && (
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$colorSecondary"
            textAlign="center"
            fontStyle="italic"
          >
            {item.caption.primary}
          </Text>
        )}
      </YStack>
    ),
    [imageWidth, imageHeight, handleImagePress, items.length, t],
  )

  return (
    <YStack gap="$sm" paddingVertical="$sm" marginHorizontal="$-sm" onLayout={onLayout}>
      {containerWidth > 0 && (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(_, index) => String(index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={imageWidth + itemGap}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingLeft: 8 }}
        />
      )}
      {items.length > 1 && (
        <XStack justifyContent="center" gap="$xs" paddingHorizontal="$sm">
          {items.map((_, i) => (
            <View
              key={i}
              width={6}
              height={6}
              borderRadius={3}
              backgroundColor={i === activeIndex ? '$accent' : '$accentSubtle'}
            />
          ))}
        </XStack>
      )}
    </YStack>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
  },
})
