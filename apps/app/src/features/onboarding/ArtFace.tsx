import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { YStack } from 'tamagui'

import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'

/**
 * A full-bleed painting with its foot darkened for ink — the flow's one visual
 * gesture, shared by the opening slides, the profiler's questions, and the
 * closing screen. The scrim is an SVG ramp rather than stacked opacity blocks:
 * a hard-edged block leaves a visible seam across the picture.
 *
 * The width/height are passed rather than flexed because two of the three
 * callers are rows in a horizontal FlatList, which don't inherit the list's
 * height — left to `flex: 1` the content silently collapses to the top.
 */
export function ArtFace({
  artId,
  label,
  width,
  height,
  children,
}: {
  artId: string
  /** Describes the painting for screen readers. */
  label: string
  width: number
  height: number
  /** The ink laid over the darkened foot. */
  children: ReactNode
}) {
  const art = artFor(artId)
  const tone = toneByIndex(toneIndexForId(artId))
  const scrimId = `vigil-scrim-${artId.replace(/\W/g, '-')}`

  return (
    <YStack width={width} height={height} backgroundColor={tone.from} justifyContent="flex-end">
      {art ? (
        <Image
          source={art}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={280}
          cachePolicy="memory-disk"
          accessibilityLabel={label}
        />
      ) : null}

      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={scrimId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.25" stopColor="#0E0D0C" stopOpacity="0" />
            <Stop offset="0.62" stopColor="#0E0D0C" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#0E0D0C" stopOpacity="0.97" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill={`url(#${scrimId})`} />
      </Svg>

      {/* The scrim is absolutely positioned, so in-flow ink would paint under it
          on web (positioned boxes paint above non-positioned siblings). */}
      <YStack zIndex={1}>{children}</YStack>
    </YStack>
  )
}
