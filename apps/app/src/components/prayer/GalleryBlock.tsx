// biome-ignore-all lint/suspicious/noArrayIndexKey: static gallery items and dot indicators
import type { BilingualText } from '@ember/content-engine'
import { Image, type ImageLoadEventData } from 'expo-image'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FlatList,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'
import { useImageViewer } from '@/components/ImageViewerContext'
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri'

type GalleryItem = {
  src: string
  alt?: BilingualText
  title?: BilingualText
  attribution?: BilingualText
  caption?: BilingualText
}

type Display = 'carousel' | 'stack' | 'row'

type Props = {
  items: GalleryItem[]
  display?: Display
  caption?: BilingualText
  weights?: number[]
}

// Below this per-item width, `row` switches from grid to bleed-and-swipe.
const ROW_MIN_ITEM_WIDTH = 140
const ROW_GAP = 10
const CAROUSEL_PEEK = 24
const CAROUSEL_GAP = 10

export function GalleryBlock({ items, display = 'carousel', caption, weights }: Props) {
  const { openViewer } = useImageViewer()

  const openLightbox = useCallback(
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

  if (display === 'stack') return <Stack items={items} caption={caption} onPress={openLightbox} />
  if (display === 'row')
    return <Row items={items} caption={caption} weights={weights} onPress={openLightbox} />
  return <Carousel items={items} caption={caption} onPress={openLightbox} />
}

function GalleryImage({
  src,
  width,
  height,
  aspectRatio,
  contentFit,
  alt,
  onAspectRatio,
}: {
  src: string
  width?: number
  height?: number
  aspectRatio?: number
  contentFit: 'cover' | 'contain'
  alt?: string
  onAspectRatio?: (ratio: number) => void
}) {
  const resolvedSrc = useResolvedImageUri(src)
  const onLoad = useCallback(
    (event: ImageLoadEventData) => {
      const w = event.source?.width
      const h = event.source?.height
      if (w && h && onAspectRatio) onAspectRatio(w / h)
    },
    [onAspectRatio],
  )
  return (
    <Image
      source={{ uri: resolvedSrc }}
      style={[styles.image, { width, height, aspectRatio }]}
      contentFit={contentFit}
      accessibilityLabel={alt}
      onLoad={onAspectRatio ? onLoad : undefined}
    />
  )
}

function ItemCaption({
  title,
  attribution,
  caption,
}: {
  title?: BilingualText
  attribution?: BilingualText
  caption?: BilingualText
}) {
  if (!title && !attribution && !caption) return null
  return (
    <YStack gap="$xs" alignItems="center">
      {title && (
        <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
          {title.primary}
        </Text>
      )}
      {attribution && (
        <Text fontFamily="$body" fontSize="$1" color="$colorMuted" textAlign="center">
          {attribution.primary}
        </Text>
      )}
      {caption && (
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$colorSecondary"
          textAlign="center"
          fontStyle="italic"
        >
          {caption.primary}
        </Text>
      )}
    </YStack>
  )
}

function SharedCaption({ caption }: { caption?: BilingualText }) {
  if (!caption) return null
  return (
    <Text
      fontFamily="$body"
      fontSize="$2"
      color="$colorSecondary"
      textAlign="center"
      fontStyle="italic"
      paddingHorizontal="$md"
    >
      {caption.primary}
    </Text>
  )
}

// ---------- Carousel ----------

function Carousel({
  items,
  caption,
  onPress,
}: {
  items: GalleryItem[]
  caption?: BilingualText
  onPress: (index: number) => void
}) {
  const { t } = useTranslation()
  const [containerWidth, setContainerWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const imageWidth = containerWidth > 0 ? containerWidth - CAROUSEL_PEEK - CAROUSEL_GAP : 0
  const imageHeight = imageWidth * 1.3

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  const onScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      if (imageWidth <= 0) return
      const index = Math.round(e.nativeEvent.contentOffset.x / (imageWidth + CAROUSEL_GAP))
      setActiveIndex(Math.max(0, Math.min(index, items.length - 1)))
    },
    [imageWidth, items.length],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => (
      <YStack width={imageWidth} marginRight={CAROUSEL_GAP} alignItems="center" gap="$xs">
        <Pressable
          onPress={() => onPress(index)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.viewGalleryImage', {
            index: index + 1,
            total: items.length,
          })}
        >
          <GalleryImage
            src={item.src}
            width={imageWidth}
            height={imageHeight}
            contentFit="cover"
            alt={item.alt?.primary}
          />
        </Pressable>
        <ItemCaption title={item.title} attribution={item.attribution} caption={item.caption} />
      </YStack>
    ),
    [imageWidth, imageHeight, onPress, items.length, t],
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
          snapToInterval={imageWidth + CAROUSEL_GAP}
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
      <SharedCaption caption={caption} />
    </YStack>
  )
}

// ---------- Stack ----------

function Stack({
  items,
  caption,
  onPress,
}: {
  items: GalleryItem[]
  caption?: BilingualText
  onPress: (index: number) => void
}) {
  const { width } = useWindowDimensions()
  const imageWidth = Math.min(width - 96, 500)
  return (
    <YStack gap="$md" paddingVertical="$sm">
      {items.map((item, index) => (
        <StackItem key={index} item={item} imageWidth={imageWidth} onPress={() => onPress(index)} />
      ))}
      <SharedCaption caption={caption} />
    </YStack>
  )
}

function StackItem({
  item,
  imageWidth,
  onPress,
}: {
  item: GalleryItem
  imageWidth: number
  onPress: () => void
}) {
  const [aspectRatio, setAspectRatio] = useState(1)
  return (
    <YStack alignItems="center" gap="$xs">
      <Pressable onPress={onPress} accessibilityRole="button">
        <GalleryImage
          src={item.src}
          width={imageWidth}
          aspectRatio={aspectRatio}
          contentFit="contain"
          alt={item.alt?.primary}
          onAspectRatio={setAspectRatio}
        />
      </Pressable>
      <ItemCaption title={item.title} attribution={item.attribution} caption={item.caption} />
    </YStack>
  )
}

// ---------- Row ----------

function Row({
  items,
  caption,
  weights,
  onPress,
}: {
  items: GalleryItem[]
  caption?: BilingualText
  weights?: number[]
  onPress: (index: number) => void
}) {
  const { t } = useTranslation()
  const [containerWidth, setContainerWidth] = useState(0)
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }, [])

  const fitsAsGrid = useFitsAsGrid(containerWidth, items.length)
  const validWeights =
    weights && weights.length === items.length && weights.every((w) => w > 0) ? weights : undefined

  if (containerWidth === 0) {
    return <YStack onLayout={onLayout} paddingVertical="$sm" minHeight={1} />
  }

  if (fitsAsGrid) {
    const totalWeight = validWeights ? validWeights.reduce((acc, w) => acc + w, 0) : items.length
    const innerWidth = containerWidth - ROW_GAP * (items.length - 1)
    return (
      <YStack gap="$sm" paddingVertical="$sm" onLayout={onLayout}>
        <XStack gap={ROW_GAP}>
          {items.map((item, index) => {
            const itemWeight = validWeights ? validWeights[index] : 1
            const itemWidth = (innerWidth * itemWeight) / totalWeight
            return (
              <RowItem
                key={index}
                item={item}
                width={itemWidth}
                onPress={() => onPress(index)}
                a11yLabel={t('a11y.viewGalleryImage', {
                  index: index + 1,
                  total: items.length,
                })}
              />
            )
          })}
        </XStack>
        <SharedCaption caption={caption} />
      </YStack>
    )
  }

  const slideWidth = containerWidth * 0.75
  return (
    <YStack gap="$sm" paddingVertical="$sm" marginHorizontal="$-sm" onLayout={onLayout}>
      <FlatList
        data={items}
        keyExtractor={(_, index) => String(index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth + ROW_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item, index }) => (
          <View width={slideWidth} marginRight={ROW_GAP}>
            <RowItem
              item={item}
              width={slideWidth}
              onPress={() => onPress(index)}
              a11yLabel={t('a11y.viewGalleryImage', {
                index: index + 1,
                total: items.length,
              })}
            />
          </View>
        )}
      />
      <SharedCaption caption={caption} />
    </YStack>
  )
}

function RowItem({
  item,
  width,
  onPress,
  a11yLabel,
}: {
  item: GalleryItem
  width: number
  onPress: () => void
  a11yLabel: string
}) {
  const [aspectRatio, setAspectRatio] = useState(1)
  return (
    <YStack alignItems="center" gap="$xs" width={width}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11yLabel}>
        <GalleryImage
          src={item.src}
          width={width}
          aspectRatio={aspectRatio}
          contentFit="cover"
          alt={item.alt?.primary}
          onAspectRatio={setAspectRatio}
        />
      </Pressable>
      <ItemCaption title={item.title} attribution={item.attribution} caption={item.caption} />
    </YStack>
  )
}

// Exposed for tests.
export function useFitsAsGrid(containerWidth: number, count: number): boolean {
  if (count <= 1) return true
  if (containerWidth <= 0) return false
  const requiredWidth = count * ROW_MIN_ITEM_WIDTH + (count - 1) * ROW_GAP
  return containerWidth >= requiredWidth
}

export const __testing = {
  ROW_MIN_ITEM_WIDTH,
  ROW_GAP,
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
  },
})
