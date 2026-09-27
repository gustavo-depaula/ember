import { Image, type ImageSource } from 'expo-image'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, Rect } from 'react-native-svg'
import { Text, View, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { GeneratedCover, type TileCover } from '@/features/covers'
import { coverInk, mixHex, ToneGradient } from '@/features/covers/parts'
import { type BlockTone, blockInk } from './bgColor'

export type FeatureBlockData = {
  key: string
  label: string
  title: string
  subtitle?: string
  image?: ImageSource
  /** The item's generated cover, drawn when it has no art. */
  cover?: TileCover
  /** The name the cover carries, when the card's title says something else. */
  coverTitle?: string
  tone: BlockTone
  onPress: () => void
}

/**
 * One card in the featured carousel, after Apple Podcasts' Up Next: tinted
 * from the item's own tone, its cover centered on top (the painting, else the
 * cover it draws in the library, else a plate with ✠), then a quiet label, the
 * title and a few lines of what it is. Sized by the carousel; everything
 * scales off the card's width.
 */
export function FeatureBlock({
  label,
  title,
  subtitle,
  image,
  cover,
  coverTitle,
  tone,
  onPress,
}: Omit<FeatureBlockData, 'key'>) {
  const [width, setWidth] = useState(0)
  const coverSize = Math.round(width * 0.6)
  return (
    <AnimatedPressable
      style={{ flex: 1 }}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <YStack
        flex={1}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        borderRadius={16}
        overflow="hidden"
        backgroundColor={cardTint(tone)}
        paddingHorizontal={16}
        paddingTop={20}
        paddingBottom={16}
      >
        {width > 0 && (
          <View
            alignSelf="center"
            width={coverSize}
            height={coverSize}
            alignItems="center"
            justifyContent="center"
          >
            {image ? (
              <Image
                source={image}
                style={{ width: coverSize, height: coverSize, borderRadius: 6 }}
                contentFit="cover"
                transition={250}
                cachePolicy="memory-disk"
                accessibilityLabel={title}
              />
            ) : cover ? (
              <GeneratedCover
                cover={cover}
                title={coverTitle ?? title}
                tone={tone}
                // Books stand 2:3 — fit the height, not the width.
                width={cover.kind === 'book' ? coverSize / 1.5 : coverSize}
              />
            ) : (
              <Plate tone={tone} size={coverSize} />
            )}
          </View>
        )}

        <YStack flex={1} marginTop={16} gap={2}>
          <Typography color="rgba(245,239,226,0.55)" fontSize={13} numberOfLines={1}>
            {label}
          </Typography>
          <Typography
            fontFamily="$body"
            fontWeight="600"
            color={blockInk}
            fontSize={18}
            lineHeight={22}
            numberOfLines={2}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              color="rgba(245,239,226,0.72)"
              fontSize={14}
              lineHeight={18}
              numberOfLines={3}
            >
              {subtitle}
            </Typography>
          )}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

/** The card's ground: its tone sunk most of the way to near-black. */
export function cardTint(tone: BlockTone) {
  return mixHex(tone.from, '#0B0908', 0.72)
}

/** The cover for an item with none: its tone, the ✠ of the carousel's fleurons. */
function Plate({ tone, size }: { tone: BlockTone; size: number }) {
  return (
    <View width={size} height={size} borderRadius={6} overflow="hidden">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <ToneGradient id={`plate-${tone.from}`} tone={tone} />
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#plate-${tone.from})`} />
      </Svg>
      <View flex={1} alignItems="center" justifyContent="center">
        <Text fontFamily="$heading" fontSize={Math.round(size * 0.22)} color={coverInk.gold}>
          ✠
        </Text>
      </View>
    </View>
  )
}
