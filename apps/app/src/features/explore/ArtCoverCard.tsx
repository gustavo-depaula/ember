import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { type BlockTone, blockInk } from './bgColor'

/**
 * Cover card for the Explore rows — Apple "Top Shows" geometry in Ember's skin.
 * Square by default; pass `aspectRatio`/`radius` for a book shape (taller, squared
 * corners). With art it's the painting; without, an illuminated versal (the
 * title's initial) on a jewel-toned block, so an unsourced row still reads as
 * deliberate. Title + subtitle sit beneath.
 *
 * Pass `href` to navigate with an iOS zoom-morph (the cover morphs into its
 * detail screen); `onPress` then fires alongside the press (e.g. to warm a
 * manifest). Without `href`, `onPress` handles navigation directly.
 */
export function ArtCoverCard({
  title,
  subtitle,
  image,
  tone,
  href,
  onPress,
  size = 150,
  aspectRatio = 1,
  radius = 14,
  rank,
  glyph,
}: {
  title: string
  subtitle?: string
  image?: ImageSource
  tone: BlockTone
  href?: Href
  onPress?: () => void
  size?: number
  /** Height = width × aspectRatio. 1 = square; ~1.5 = book. */
  aspectRatio?: number
  radius?: number
  rank?: number
  /** Centered cover mark shown instead of the title's versal initial (no image). */
  glyph?: ReactNode
}) {
  const initial = Array.from(title.trim())[0]?.toUpperCase() ?? '✠'
  const height = Math.round(size * aspectRatio)
  const card = (
    <AnimatedPressable
      onPress={href ? undefined : onPress}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <YStack width={size} gap="$sm">
        <YStack
          width={size}
          height={height}
          borderRadius={radius}
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          backgroundColor={tone.from}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.18}
          shadowRadius={12}
        >
          {image ? (
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={title}
            />
          ) : glyph ? (
            glyph
          ) : (
            <Text
              fontFamily="$heading"
              color={blockInk}
              fontSize={Math.round(size * 0.4)}
              lineHeight={Math.round(size * 0.58)}
              textAlign="center"
            >
              {initial}
            </Text>
          )}
          {rank !== undefined && (
            <YStack
              position="absolute"
              top={6}
              left={6}
              minWidth={22}
              height={22}
              paddingHorizontal={6}
              borderRadius={11}
              backgroundColor="rgba(0,0,0,0.55)"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontFamily="$heading" fontSize="$1" color={blockInk}>
                {rank}
              </Text>
            </YStack>
          )}
        </YStack>
        <YStack gap={2}>
          <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
              {subtitle}
            </Text>
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
