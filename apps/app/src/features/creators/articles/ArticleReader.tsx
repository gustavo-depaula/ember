import { ExternalLink } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { openExternalUrl } from '@/config/links'
import type { CreatorChannel } from '@/content/manifestTypes'
import type { FeedItemRow } from '@/db/repositories/feedItems'
import { ReaderWebView } from '@/features/books/ReaderWebView'
import { resolveArticleMode } from './articleSource'

const READER_DOC = (body: string) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>body{font-family:Georgia,serif;line-height:1.6;padding:24px;color:#222;background:transparent;}img,figure{max-width:100%;height:auto;}</style>
</head><body>${body}</body></html>`

export function ArticleReader({ item, channel }: { item: FeedItemRow; channel: CreatorChannel }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const summary = item.summary ?? ''
  const { mode } = resolveArticleMode(channel, summary)
  const date = new Intl.DateTimeFormat(i18n.language || 'en-US', { dateStyle: 'long' }).format(
    new Date(item.publishedAt),
  )
  const html = useMemo(() => READER_DOC(summary), [summary])

  if (mode === 'fullText') {
    return (
      <YStack flex={1} backgroundColor="$background">
        <YStack padding="$lg" gap="$sm">
          <Text fontFamily="$display" fontSize="$5" color="$color">
            {item.title}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {date}
          </Text>
        </YStack>
        <ReaderWebView html={html} />
      </YStack>
    )
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$lg" gap="$md">
        <Text fontFamily="$display" fontSize="$5" color="$color">
          {item.title}
        </Text>
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
