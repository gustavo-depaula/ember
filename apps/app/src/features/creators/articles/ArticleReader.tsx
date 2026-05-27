import { ExternalLink } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { openExternalUrl } from '@/config/links'
import type { CreatorChannel } from '@/content/manifestTypes'
import type { FeedItemRow } from '@/db/repositories/feedItems'
import { RichDescription } from '../components/RichDescription'
import { resolveArticleMode } from './articleSource'

export function ArticleReader({ item, channel }: { item: FeedItemRow; channel: CreatorChannel }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const summary = item.summary ?? ''
  const { mode } = resolveArticleMode(channel, summary)
  const date = new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'long' }).format(
    new Date(item.publishedAt),
  )

  if (mode === 'fullText') {
    return (
      <YStack flex={1} backgroundColor="$background">
        <YStack padding="$lg" gap="$sm">
          <Typography variant="sacred-title" fontSize="$5" color="$color" textAlign="left">
            {item.title}
          </Typography>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {date}
          </Text>
        </YStack>
        <RichDescription html={summary} />
      </YStack>
    )
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$lg" gap="$md">
        <Typography variant="sacred-title" fontSize="$5" color="$color" textAlign="left">
          {item.title}
        </Typography>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {date}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$color" lineHeight={24}>
          {summary || t('creators.noSummary')}
        </Text>
        {item.webUrl && (
          <AnimatedPressable
            onPress={() => openExternalUrl(item.webUrl)}
            accessibilityRole="link"
            accessibilityLabel={t('creators.openOriginal')}
          >
            <XStack
              gap="$sm"
              alignItems="center"
              justifyContent="center"
              padding="$md"
              borderRadius="$md"
              backgroundColor="$accentSubtle"
            >
              <ExternalLink size={18} color={theme.accent.val} />
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('creators.openOriginal')}
              </Text>
            </XStack>
          </AnimatedPressable>
        )}
      </YStack>
    </ScrollView>
  )
}
