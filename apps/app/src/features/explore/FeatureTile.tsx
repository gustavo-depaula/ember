import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import { StyleSheet } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from './bgColor'

/**
 * A medium editorial card — the hero `FeatureBlock` shrunk for a horizontal row.
 * Full-bleed painting (or a solid jewel tone with no art) with a lower-third
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
  width?: number
  height?: number
}) {
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
        justifyContent="flex-end"
        backgroundColor={tone.from}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 6 }}
        shadowOpacity={0.18}
        shadowRadius={12}
      >
        {image && (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            accessibilityLabel={title}
          />
        )}
        <YStack
          padding="$md"
          gap="$xs"
          backgroundColor={image ? 'rgba(0,0,0,0.42)' : 'transparent'}
        >
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
            fontSize={20}
            lineHeight={24}
            numberOfLines={3}
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
