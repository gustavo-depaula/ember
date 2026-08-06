import { Image, type ImageSource } from 'expo-image'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'

import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'

import { type BlockTone, blockInk, blockLabelInk } from './bgColor'

/**
 * The ground a choice card is painted on — its art when one is mapped, else the
 * illuminated versal on a jewel tone (the app's standing fallback, so an
 * unsourced card still reads as deliberate).
 */
function ChoiceGround({
  title,
  image,
  tone,
  aspectRatio,
  children,
}: {
  title: string
  image?: ImageSource
  tone: BlockTone
  aspectRatio: number
  children?: ReactNode
}) {
  return (
    <YStack
      width="100%"
      aspectRatio={aspectRatio}
      borderRadius="$lg"
      overflow="hidden"
      backgroundColor={tone.from}
      alignItems="center"
      justifyContent="center"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 5 }}
      shadowOpacity={0.22}
      shadowRadius={12}
    >
      {image ? (
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
          accessibilityLabel={title}
        />
      ) : (
        <Text fontFamily="$title" fontSize={84} lineHeight={92} color={blockInk} opacity={0.16}>
          {title.trim().charAt(0).toUpperCase() || '✠'}
        </Text>
      )}
      {children}
    </YStack>
  )
}

export type ArtChoice = {
  title: string
  description?: string
  image?: ImageSource
  tone: BlockTone
}

/**
 * The grid tile — a square ground with the name and a line beneath. Shared by
 * the `/templates` browser and by onboarding's tradition and reading steps, so
 * anything offered as a choice is offered the same way. Callers own the press
 * behaviour (a ZoomLink to a detail screen, or opening a sheet).
 */
export function ArtChoiceCard({
  choice,
  marker,
  aspectRatio = 1,
  titleSize = '$5',
  titleLineHeight = '$3',
}: {
  choice: ArtChoice
  marker?: string
  /**
   * Width ÷ height, as React Native defines it. 1 is square (the traditions'
   * paintings); **below** 1 is a portrait page — the saint cards are 0.667.
   */
  aspectRatio?: number
  /** Drop this for long names — a work's full title breaks mid-word at hero size. */
  titleSize?: number | '$5'
  titleLineHeight?: number | '$3'
}) {
  return (
    <YStack gap="$sm">
      <ChoiceGround
        title={choice.title}
        image={choice.image}
        tone={choice.tone}
        aspectRatio={aspectRatio}
      />
      <YStack gap={2}>
        {marker && (
          <Typography
            variant="label"
            textTransform="uppercase"
            letterSpacing={1.5}
            fontSize="$1"
            tone="muted"
          >
            {marker}
          </Typography>
        )}
        <Typography
          variant="screen-title"
          textAlign="left"
          fontSize={titleSize}
          paddingTop="$sm"
          lineHeight={titleLineHeight}
          numberOfLines={2}
        >
          {choice.title}
        </Typography>
        {choice.description && (
          <Typography variant="caption" tone="muted" numberOfLines={2}>
            {choice.description}
          </Typography>
        )}
      </YStack>
    </YStack>
  )
}

/**
 * The frontispiece treatment — a wide ground with the name set *over* it in
 * cream under a gold marker. Used where one choice is held out ahead of the
 * rest (onboarding's suggested tradition and suggested reading).
 */
export function ArtChoiceFeatureCard({
  choice,
  marker,
  aspectRatio = 4 / 3,
}: {
  choice: ArtChoice
  marker?: string
  /** Width ÷ height, as React Native defines it. Below 1 is a portrait page. */
  aspectRatio?: number
}) {
  return (
    <YStack gap="$sm">
      <ChoiceGround
        title={choice.title}
        image={choice.image}
        tone={choice.tone}
        aspectRatio={aspectRatio}
      >
        {/* A soft scrim so cream ink reads over a bright ground — the same
            treatment as TemplateHero's frontispiece. */}
        <YStack
          style={StyleSheet.absoluteFill}
          backgroundColor="#000"
          opacity={0.32}
          pointerEvents="none"
        />
        <YStack
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          padding="$md"
          gap="$xs"
          pointerEvents="none"
        >
          {marker && (
            <Typography
              variant="label"
              textAlign="left"
              textTransform="uppercase"
              letterSpacing={1.5}
              fontSize="$1"
              color={blockLabelInk}
              style={textShadow}
            >
              {marker}
            </Typography>
          )}
          <Typography
            variant="screen-title"
            textAlign="left"
            // Numeric, not a token: a styled(Text)'s size type is inferred from
            // the default $body font, so a hero size must be raw.
            fontSize={36}
            lineHeight={42}
            color={blockInk}
            style={textShadow}
          >
            {choice.title}
          </Typography>
        </YStack>
      </ChoiceGround>
      {choice.description && (
        <Typography variant="caption" tone="muted">
          {choice.description}
        </Typography>
      )}
    </YStack>
  )
}
