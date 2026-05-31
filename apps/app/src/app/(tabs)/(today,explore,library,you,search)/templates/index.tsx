import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { ScreenLayout } from '@/components/ScreenLayout'
import { Typography } from '@/components/typography'
import { artFor } from '@/features/explore/artMap'
import { blockInk, toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { type TemplateListItem, useTemplateList } from '@/features/templates'
import { localizeContent } from '@/lib/i18n'

/**
 * Browse the living traditions — a masthead over a two-column grid of
 * image-forward cards, each a tradition's masterpiece with its name and a line
 * beneath. The catalog entry carries the localized name / description / icon, so
 * the list needs no manifest fetch; the painting comes from the app-side artMap.
 */
export default function TemplatesScreen() {
  const { t } = useTranslation()
  const templates = useTemplateList()

  return (
    <ScreenLayout>
      <YStack marginTop="$sm" marginBottom="$lg" gap="$xs">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('templates.subtitle')}
        </Typography>
        <Typography variant="screen-title">{t('templates.title')}</Typography>
      </YStack>

      <XStack flexWrap="wrap" justifyContent="space-between" rowGap="$xl">
        {templates.map((item) => (
          <TemplateCard key={item.id} item={item} />
        ))}
      </XStack>
    </ScreenLayout>
  )
}

function TemplateCard({ item }: { item: TemplateListItem }) {
  const name = item.entry.name ? localizeContent(item.entry.name) : item.id
  const description = item.entry.description ? localizeContent(item.entry.description) : undefined
  const art = artFor(item.id)
  const tone = toneByIndex(toneIndexForId(item.id))
  const initial = name.trim().charAt(0).toUpperCase() || '✠'
  const templateId = item.id.slice(item.id.indexOf('/') + 1)

  return (
    <YStack width="48%">
      <ZoomLink href={{ pathname: '/templates/[templateId]', params: { templateId } }}>
        <AnimatedPressable accessibilityRole="link" accessibilityLabel={name}>
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
                <Text
                  fontFamily="$title"
                  fontSize={84}
                  lineHeight={92}
                  color={blockInk}
                  opacity={0.16}
                >
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
                <Typography marginTop={-10} variant="caption" tone="muted" numberOfLines={2}>
                  {description}
                </Typography>
              )}
            </YStack>
          </YStack>
        </AnimatedPressable>
      </ZoomLink>
    </YStack>
  )
}
