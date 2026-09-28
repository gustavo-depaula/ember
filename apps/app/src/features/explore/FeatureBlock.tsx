import { Image, type ImageSource } from 'expo-image'
import { type ReactNode, useState } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
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
  /** A row under the text, e.g. Pray now's ✠ and minutes. */
  footer?: ReactNode
}

/**
 * One card in the featured carousel, after Apple Podcasts' Up Next, tinted
 * from the item's own tone. A painting runs full-bleed across the top and
 * fades into the card; anything else shows its cover centered (the one it
 * draws in the library, else a plate with ✠). The text sits at the foot: a
 * tracked-caps kicker, the title in the manuscript face, a few lines of what
 * it is. Sized by the carousel; the cover scales off the card's width.
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
  footer,
}: Omit<FeatureBlockData, 'key'>) {
  const [width, setWidth] = useState(0)
  const coverSize = Math.round(width * 0.6)
  const tint = cardTint(tone)
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
        backgroundColor={tint}
      >
        {image ? (
          <View flex={1}>
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
              accessibilityLabel={title}
            />
            <Fade tint={tint} />
          </View>
        ) : (
          <View flex={1} alignItems="center" justifyContent="center" paddingTop={8}>
            {width > 0 &&
              (cover ? (
                <GeneratedCover
                  cover={cover}
                  title={coverTitle ?? title}
                  tone={tone}
                  // Books stand 2:3 — fit the height, not the width.
                  width={cover.kind === 'book' ? coverSize / 1.5 : coverSize}
                />
              ) : (
                <Plate tone={tone} size={coverSize} />
              ))}
          </View>
        )}

        <YStack
          paddingHorizontal={18}
          paddingBottom={footer ? 14 : 18}
          // Over a painting the kicker rides the fade, as on the podcast card.
          marginTop={image ? -28 : 12}
          gap={4}
        >
          <Typography
            fontFamily="$heading"
            color="rgba(245,239,226,0.62)"
            fontSize={11}
            lineHeight={14}
            letterSpacing={1.4}
            textTransform="uppercase"
            numberOfLines={1}
          >
            {label}
          </Typography>
          <Typography
            fontFamily="$title"
            fontWeight="500"
            color={blockInk}
            fontSize={21}
            lineHeight={25}
            numberOfLines={2}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              color="rgba(245,239,226,0.7)"
              fontSize={14}
              lineHeight={19}
              numberOfLines={footer ? 2 : 3}
            >
              {subtitle}
            </Typography>
          )}
          {footer}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

/** The painting's foot dissolving into the card, so the text needs no box. */
function Fade({ tint }: { tint: string }) {
  const id = `fade-${tint}`
  return (
    <Svg style={styles.fade} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} stopOpacity={0} />
          <Stop offset="0.7" stopColor={tint} stopOpacity={0.85} />
          <Stop offset="1" stopColor={tint} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%' },
})

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
