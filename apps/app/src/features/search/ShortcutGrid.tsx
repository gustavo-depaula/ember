import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import type { ComponentType } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { type BlockTone, blockInk, toneForKey } from '@/features/explore/bgColor'

// ScreenLayout caps content at 640 and pads $lg (24) each side; tiles sit two-up
// with a $md (16) gutter. Sizing the cover from the window keeps the grid honest
// on phones and the centered desktop column alike.
const maxContentWidth = 640
const pagePadding = 24
const gutter = 16
const tileAspect = 0.84 // height / width — squarish, with room for a big title

function useTileSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, maxContentWidth) - pagePadding * 2
  return Math.floor((content - gutter) / 2)
}

// — Color helpers: muting the vivid jewel tones into a soft, low-contrast wash
// so a tile reads like aged vellum under a wash of color, not a neon gradient.
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => Number.parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => Number.parseInt(b.slice(i, i + 2), 16))
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t))
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/**
 * Gentle vertical gradient on the rich jewel base. The original `from→to` was
 * harsh — a big diagonal jump to a near-black corner. Here we keep the saturated
 * `tone.from` (no graying-out) and only breathe it a touch lighter at the top
 * and deeper at the bottom, so the fall-off is smooth, not a visible band.
 */
function softStops(tone: BlockTone): [string, string] {
  return [mix(tone.from, '#FFFFFF', 0.08), mix(tone.from, '#000000', 0.24)]
}

export type ShortcutTileData = {
  key: string
  title: string
  /** Jewel ground for art-less tiles; defaults to a rotating palette by index. */
  tone?: BlockTone
  href?: Href
  onPress?: () => void
  /** Real cover art; when present it wins over the gradient ground. */
  image?: ImageSource
  /** Lucide icon shown as a faint watermark behind the title on art-less tiles. */
  icon?: ComponentType<{ size?: number; color?: string }>
}

function ShortcutTile({
  title,
  tone,
  href,
  onPress,
  image,
  icon: Icon,
  size,
}: Omit<ShortcutTileData, 'key'> & { tone: BlockTone; size: number }) {
  const height = Math.round(size * tileAspect)
  const [top, bottom] = softStops(tone)
  const titleSize = Math.round(size * 0.135)
  const gid = `g-${tone.from.slice(1)}`

  const card = (
    <AnimatedPressable
      onPress={href ? undefined : onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <YStack
        width={size}
        height={height}
        borderRadius={16}
        overflow="hidden"
        justifyContent="flex-end"
        backgroundColor={bottom}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.16}
        shadowRadius={10}
      >
        {image ? (
          <>
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={title}
            />
            {/* Bottom scrim so the cream title reads over any painting. */}
            <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={`${gid}-scrim`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0.35" stopColor="#000000" stopOpacity="0" />
                  <Stop offset="1" stopColor="#000000" stopOpacity="0.62" />
                </LinearGradient>
              </Defs>
              <Rect width={size} height={height} fill={`url(#${gid}-scrim)`} />
            </Svg>
          </>
        ) : (
          <Svg width={size} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={top} />
                <Stop offset="1" stopColor={bottom} />
              </LinearGradient>
            </Defs>
            <Rect width={size} height={height} fill={`url(#${gid})`} />
          </Svg>
        )}

        {!image && Icon && (
          <XStack position="absolute" top="$sm" right="$sm" opacity={0.16}>
            <Icon size={Math.round(size * 0.5)} color={blockInk} />
          </XStack>
        )}

        <Text
          fontFamily="$title"
          color={blockInk}
          fontSize={titleSize}
          lineHeight={Math.round(titleSize * 1.08)}
          padding="$md"
          numberOfLines={3}
        >
          {title}
        </Text>
      </YStack>
    </AnimatedPressable>
  )

  if (href)
    return (
      <ZoomLink href={href} onPress={onPress}>
        {card}
      </ZoomLink>
    )
  return card
}

/** A two-column grid of illuminated cover tiles — the search portfolio's body. */
export function ShortcutGrid({ items }: { items: ShortcutTileData[] }) {
  const size = useTileSize()
  return (
    <XStack flexWrap="wrap" gap={gutter} justifyContent="space-between">
      {items.map(({ key, ...tile }) => (
        <ShortcutTile key={key} {...tile} tone={tile.tone ?? toneForKey(key)} size={size} />
      ))}
    </XStack>
  )
}

// Full content width (one tile + gutter + one tile), so the banner spans exactly two cards.
function useBannerWidth(): number {
  const { width } = useWindowDimensions()
  return Math.min(width, maxContentWidth) - pagePadding * 2
}

/**
 * A wide, two-card-spanning banner in the same jewel language as the grid — same height as a single
 * tile, but laid out horizontally: an icon on the left, the title + subtitle right-aligned on the
 * right. For a marquee feature that earns its own line above the grid.
 */
export function WideShortcutCard({
  title,
  subtitle,
  tone,
  href,
  onPress,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  tone: BlockTone
  href?: Href
  onPress?: () => void
  icon?: ComponentType<{ size?: number; color?: string }>
}) {
  const width = useBannerWidth()
  const height = Math.round(useTileSize() * tileAspect) // match the grid tiles' height
  const [top, bottom] = softStops(tone)
  const gid = `g-wide-${tone.from.slice(1)}`

  const card = (
    <AnimatedPressable
      onPress={href ? undefined : onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <YStack
        width={width}
        height={height}
        borderRadius={16}
        overflow="hidden"
        backgroundColor={bottom}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.16}
        shadowRadius={10}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={top} />
              <Stop offset="1" stopColor={bottom} />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={height} fill={`url(#${gid})`} />
        </Svg>

        {/* Faded icon watermark, inset from the left edge (sits behind the right-aligned title). */}
        {Icon && (
          <XStack
            position="absolute"
            top={0}
            bottom={0}
            left={width * 0.13}
            alignItems="center"
            opacity={0.16}
          >
            <Icon size={Math.round(height * 0.62)} color={blockInk} />
          </XStack>
        )}

        <YStack flex={1} justifyContent="center" alignItems="flex-end" paddingHorizontal="$lg">
          <Text
            fontFamily="$title"
            color={blockInk}
            fontSize={Math.round(height * 0.26)}
            lineHeight={Math.round(height * 0.32)}
            textAlign="right"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              fontFamily="$body"
              color={blockInk}
              opacity={0.85}
              fontSize={Math.round(height * 0.105)}
              textAlign="right"
              marginTop={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )

  if (href)
    return (
      <ZoomLink href={href} onPress={onPress}>
        {card}
      </ZoomLink>
    )
  return card
}
