import { Image } from 'expo-image'
import { Platform, StyleSheet } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { Typography } from '@/components/typography'
import { artFor } from '@/features/explore/artMap'
import { blockInk, toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

import type { TemplateListItem } from './hooks'

/**
 * A tradition as the Traditions screen shows it: its painting (or a solid
 * liturgical block), name and one-line description, opening the tradition.
 */
export function TemplateCard({
  item,
  width = '48%',
  onPress,
}: {
  item: TemplateListItem
  width?: number | `${number}%`
  /** Opens the tradition itself instead of the zoom link — from inside a sheet, which must close first. */
  onPress?: (templateId: string) => void
}) {
  const name = item.entry.name ? localizeContent(item.entry.name) : item.id
  const description = item.entry.description ? localizeContent(item.entry.description) : undefined
  const art = artFor(item.id)
  const tone = toneByIndex(toneIndexForId(item.id))
  const initial = name.trim().charAt(0).toUpperCase() || '✠'
  const templateId = item.id.slice(item.id.indexOf('/') + 1)

  const card = (
    <AnimatedPressable
      onPress={onPress && (() => onPress(templateId))}
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      <YStack gap="$sm">
        <YStack
          width="100%"
          aspectRatio={1}
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
              {initial}
            </Text>
          )}
        </YStack>

        <YStack gap={2}>
          <Typography
            variant="screen-title"
            textAlign="left"
            fontSize="$5"
            paddingTop="$md"
            lineHeight="$3"
          >
            {name}
          </Typography>
          {description && (
            // The name's leading is tighter than its size. iOS leaves the slack
            // under the last line, so the caption tucks up into it; Android
            // sets that line flush with the box's bottom edge.
            <Typography
              marginTop={Platform.OS === 'android' ? 4 : -10}
              variant="caption"
              tone="muted"
              numberOfLines={2}
            >
              {description}
            </Typography>
          )}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )

  return (
    <YStack width={width}>
      {onPress ? (
        card
      ) : (
        <ZoomLink href={{ pathname: '/templates/[templateId]', params: { templateId } }}>
          {card}
        </ZoomLink>
      )}
    </YStack>
  )
}
