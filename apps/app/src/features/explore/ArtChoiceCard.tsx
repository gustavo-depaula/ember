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
 *
 * `fit` is 'cover' for paintings, which are cropped to the card, and 'contain'
 * for plates and engravings, which are whole pages: cropping one leaves an
 * illegible fragment, so it sits framed on the tone instead.
 */
function ChoiceGround({
  title,
  image,
  tone,
  aspectRatio,
  fit = 'cover',
  children,
}: {
  title: string
  image?: ImageSource
  tone: BlockTone
  aspectRatio: number
  fit?: 'cover' | 'contain'
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
          contentFit={fit}
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
  fit?: 'cover' | 'contain'
}

/**
 * The grid tile — a square ground with the name and a line beneath. Shared by
 * the `/templates` browser and by onboarding's tradition and reading steps, so
 * anything offered as a choice is offered the same way. Callers own the press
 * behaviour (a ZoomLink to a detail screen, or opening a sheet).
 */
export function ArtChoiceCard({
  choice,
  selected,
  marker,
  aspectRatio = 1,
  titleSize,
  titleLineHeight,
}: {
  choice: ArtChoice
  selected?: boolean
  marker?: string
  /**
   * Width ÷ height, as React Native defines it. 1 is square (the traditions'
   * paintings); **below** 1 is a portrait page — the saint cards are 0.667.
   */
  aspectRatio?: number
  /** Drop this for long names — a work's full title breaks mid-word at hero size. */
  titleSize?: number
  titleLineHeight?: number
}) {
  return (
    <YStack gap="$sm">
      <YStack
        borderRadius="$lg"
        borderWidth={2}
        borderColor={selected ? '$accent' : 'transparent'}
        padding={selected ? 3 : 0}
      >
        <ChoiceGround
          title={choice.title}
          image={choice.image}
          tone={choice.tone}
          aspectRatio={aspectRatio}
          fit={choice.fit}
        />
      </YStack>
      <YStack gap={2}>
        {marker && (
          <Typography
            variant="label"
            textTransform="uppercase"
            letterSpacing={1.5}
            fontSize="$1"
            color={selected ? '$accent' : '$colorSecondary'}
          >
            {marker}
          </Typography>
        )}
        <Typography
          variant="screen-title"
          textAlign="left"
          {...(titleSize ? { fontSize: titleSize } : { fontSize: '$5' as const })}
          paddingTop="$sm"
          {...(titleLineHeight ? { lineHeight: titleLineHeight } : { lineHeight: '$3' as const })}
          numberOfLines={2}
          color={selected ? '$accent' : undefined}
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
  overlay = true,
  aspectRatio = 4 / 3,
  selected,
}: {
  choice: ArtChoice
  marker?: string
  /**
   * Set the name *over* the art. Only honest for a dark, full-bleed painting;
   * a light plate or a whole page needs its name below it instead.
   */
  overlay?: boolean
  /** Width ÷ height. Below 1 is portrait — see `ArtChoiceCard`. */
  aspectRatio?: number
  selected?: boolean
}) {
  if (!overlay) {
    return (
      <ArtChoiceCard
        choice={choice}
        marker={marker}
        selected={selected}
        aspectRatio={aspectRatio}
      />
    )
  }
  return (
    <YStack gap="$sm">
      <ChoiceGround
        title={choice.title}
        image={choice.image}
        tone={choice.tone}
        aspectRatio={aspectRatio}
        fit={choice.fit}
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
