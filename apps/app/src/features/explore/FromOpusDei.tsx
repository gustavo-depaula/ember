/**
 * "From Opus Dei" — the recent-articles row on Explore, fed by opusdei.org's
 * Atom feed (`opusDeiContent.ts`) and rendered in Ember's voice. Cards carry the
 * article's `og:image` when it resolves (a second fetch) and fall back to a
 * solid jewel tone otherwise. Links open in the in-app browser.
 */

import { useQuery } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import { useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import i18n from '@/lib/i18n'
import { ArtCoverCard } from './ArtCoverCard'
import { toneForKey } from './bgColor'
import { CardRow } from './CardRow'
import {
  fetchOpusDeiArticles,
  fetchOpusDeiImages,
  opusDeiHome,
  opusDeiLang,
} from './opusDeiContent'

export function FromOpusDei() {
  const { t } = useTranslation()
  const theme = useTheme()
  const lang = opusDeiLang(i18n.language)

  const { data: articles } = useQuery({
    queryKey: ['opus-dei-news', lang],
    queryFn: () => fetchOpusDeiArticles(lang),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  })
  const urls = (articles ?? []).slice(0, 10).map((a) => a.url)
  const { data: images } = useQuery({
    queryKey: ['opus-dei-images', lang, urls],
    queryFn: () => fetchOpusDeiImages(urls),
    enabled: urls.length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 0,
  })

  const open = (url: string) => {
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: theme.accent?.val,
      toolbarColor: theme.background?.val,
    })
  }

  const label = (
    <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
      {t('explore.fromOpusDei')}
    </Typography>
  )
  const linkOut = (text: string) => (
    <AnimatedPressable
      onPress={() => open(opusDeiHome(lang))}
      accessibilityRole="link"
      accessibilityLabel={text}
    >
      <Typography variant="reference" color="$accent" paddingVertical="$sm">
        {text} →
      </Typography>
    </AnimatedPressable>
  )

  // Empty or failed fetch: a single link-out keeps the row honest.
  if (!articles || articles.length === 0) {
    return (
      <YStack gap="$sm">
        {label}
        {linkOut(t('explore.opusDei.readOn'))}
      </YStack>
    )
  }

  return (
    <YStack gap="$lg">
      {label}
      <CardRow>
        {articles.slice(0, 10).map((a) => (
          <ArtCoverCard
            key={a.url}
            title={a.title}
            subtitle={a.category}
            image={images?.[a.url] ? { uri: images[a.url] } : undefined}
            tone={toneForKey(a.url)}
            onPress={() => open(a.url)}
          />
        ))}
      </CardRow>
      {linkOut(t('explore.opusDei.more'))}
    </YStack>
  )
}
