import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'

import { textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { artFor } from '@/features/explore/artMap'
import { blockInk, blockLabelInk, toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

import type { TemplateListItem } from './hooks'

export function templateName(item: TemplateListItem): string {
  return item.entry.name ? localizeContent(item.entry.name) : item.id
}

function templateDescription(item: TemplateListItem): string | undefined {
  return item.entry.description ? localizeContent(item.entry.description) : undefined
}

/**
 * The tradition's masterpiece as a card ground — the painting when the artMap
 * has one, else a faint versal on the id's stable jewel tone.
 */
function ArtGround({
  item,
  aspectRatio,
  children,
}: {
  item: TemplateListItem
  aspectRatio: number
  children?: React.ReactNode
}) {
  const name = templateName(item)
  const art = artFor(item.id)
  const tone = toneByIndex(toneIndexForId(item.id))

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
      {art ? (
        <Image
          source={art}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
          accessibilityLabel={name}
        />
      ) : (
        <Text fontFamily="$title" fontSize={84} lineHeight={92} color={blockInk} opacity={0.16}>
          {name.trim().charAt(0).toUpperCase() || '✠'}
        </Text>
      )}
      {children}
    </YStack>
  )
}

/**
 * The grid tile — a square painting with the name and a line beneath. Shared by
 * the `/templates` browser and onboarding so a tradition looks the same wherever
 * it's offered. Callers own the press behaviour (ZoomLink to the tradition page,
 * or opening the adopt sheet).
 */
export function TemplateCard({ item }: { item: TemplateListItem }) {
  const description = templateDescription(item)

  return (
    <YStack gap="$sm">
      <ArtGround item={item} aspectRatio={1} />
      <YStack gap={2}>
        <Typography
          variant="screen-title"
          textAlign="left"
          fontSize="$5"
          paddingTop="$md"
          lineHeight="$3"
        >
          {templateName(item)}
        </Typography>
        {description && (
          <Typography marginTop={-10} variant="caption" tone="muted" numberOfLines={2}>
            {description}
          </Typography>
        )}
      </YStack>
    </YStack>
  )
}

/**
 * The frontispiece treatment — a wide painting with the name set *over* it in
 * cream, under an optional gold marker. Used where one tradition is being held
 * out ahead of the rest (onboarding's suggested starting plan).
 */
export function TemplateFeatureCard({ item, marker }: { item: TemplateListItem; marker?: string }) {
  const description = templateDescription(item)

  return (
    <YStack gap="$sm">
      <ArtGround item={item} aspectRatio={4 / 3}>
        {/* A soft scrim so cream ink reads over a bright painting — the same
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
            {templateName(item)}
          </Typography>
        </YStack>
      </ArtGround>
      {description && (
        <Typography variant="caption" tone="muted">
          {description}
        </Typography>
      )}
    </YStack>
  )
}
