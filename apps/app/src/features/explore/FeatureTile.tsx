import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import { useId } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useTheme, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from './bgColor'

/**
 * A medium editorial card — the hero `FeatureBlock` shrunk for a horizontal row.
 * Full-bleed painting (or a solid jewel tone with no art) with a lower-half
 * caption overlaid in cream: an optional Cinzel tracked label, a manuscript
 * headline, a whispered subtitle. Sits between the hero (340pt, full width) and
 * the small `ArtCoverCard` covers (text beneath the art).
 *
 * Pass `href` to navigate with the iOS zoom-morph; `onPress` then fires alongside
 * the press (e.g. to warm a manifest). Without `href`, `onPress` navigates.
 */
export function FeatureTile({
  title,
  subtitle,
  label,
  image,
  tone,
  href,
  onPress,
  prayed,
  width = 200,
  height = 240,
}: {
  title: string
  subtitle?: string
  label?: string
  image?: ImageSource
  tone: BlockTone
  href?: Href
  onPress?: () => void
  /** Prayed today: a lit star in the corner. */
  prayed?: boolean
  width?: number
  height?: number
}) {
  const theme = useTheme()
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
        backgroundColor={tone.from}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 6 }}
        shadowOpacity={0.18}
        shadowRadius={12}
      >
        {image && (
          <>
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={title}
            />
            <Veil />
          </>
        )}
        {prayed && (
          <YStack
            position="absolute"
            top={10}
            right={10}
            width={26}
            height={26}
            borderRadius={13}
            backgroundColor="rgba(0,0,0,0.45)"
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              color="$accent"
              fontSize={14}
              lineHeight={16}
              style={{ textShadowColor: theme.accent?.val, textShadowRadius: 5 }}
            >
              ✦
            </Typography>
          </YStack>
        )}
        {/* From a fixed line rather than up from the bottom, so the titles of a
            row start level whatever the length of the subtitle beneath. */}
        <YStack position="absolute" top={height * 0.5} left={0} right={0} padding="$md" gap="$xs">
          {label && (
            <Typography
              variant="marker"
              textAlign="left"
              color={blockLabelInk}
              fontSize="$1"
              letterSpacing={2}
            >
              {label}
            </Typography>
          )}
          <Typography
            variant="sacred-title"
            textAlign="left"
            color={blockInk}
            fontSize={19}
            lineHeight={22}
            fontWeight="600"
            numberOfLines={2}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="whisper" color="rgba(245,239,226,0.82)" numberOfLines={3}>
              {subtitle}
            </Typography>
          )}
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

/** Darkens the painting toward the caption: clear above the middle, deep at the foot. */
function Veil() {
  const id = useId()
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.3" stopColor="#000" stopOpacity={0} />
          <Stop offset="0.58" stopColor="#000" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.88} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  )
}
