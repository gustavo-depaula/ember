/**
 * "From Rome" — Vatican News, rendered natively in Ember's voice instead of the
 * white embed widget. Pulls the official widget fragment (see `vaticanContent.ts`),
 * then lays it out as stacked editorial sections: a videos row, Vatican News
 * headlines, the day's acts of the Holy See, and outlet tiles. Links open in an
 * in-app bottom-sheet browser (native) / new tab (web); videos play inline via
 * the shared `YouTubePlayer`. Falls back to the `<VaticanNews>` embed if the
 * fragment can't be parsed.
 */

import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { Image, type ImageSource } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { useTheme, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { YouTubePlayer } from '@/features/creators/video/YouTubePlayer'
import { hearthUrl } from '@/lib/hearth'
import i18n from '@/lib/i18n'
import { ArtCoverCard } from './ArtCoverCard'
import { type BlockTone, blockInk, toneByIndex } from './bgColor'
import { VaticanNews } from './VaticanNews'
import {
  fetchNewsImages,
  fetchVaticanNews,
  type VnItem,
  type VnVideo,
  vaticanWidgetLang,
} from './vaticanContent'

function NewsTile({
  item,
  tone,
  image,
  onPress,
}: {
  item: VnItem
  tone: BlockTone
  image?: string
  onPress: () => void
}) {
  return (
    <ArtCoverCard
      title={item.title}
      subtitle={item.date}
      image={image ? { uri: image } : undefined}
      tone={tone}
      onPress={onPress}
    />
  )
}

// Holy See acts are imageless document titles, often long — so the title lives
// *inside* the block (not a caption under a square), and the card grows to fit.
function HolySeeCard({
  item,
  tone,
  onPress,
}: {
  item: VnItem
  tone: BlockTone
  onPress: () => void
}) {
  return (
    // alignSelf:stretch + flex:1 let the block fill the row's tallest card
    // (flexbox align-items: stretch), so short titles get the same height.
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={item.title}
      style={{ alignSelf: 'stretch' }}
    >
      <YStack
        flex={1}
        width={196}
        backgroundColor={tone.from}
        borderRadius={14}
        padding="$md"
        gap="$sm"
      >
        <Typography variant="reference" color="rgba(245,239,226,0.7)">
          {item.date}
        </Typography>
        <Typography
          variant="whisper"
          textAlign="left"
          color={blockInk}
          fontSize="$3"
          lineHeight={24}
          numberOfLines={7}
        >
          {item.title}
        </Typography>
      </YStack>
    </AnimatedPressable>
  )
}

// Official outlet emblems (in the corpus art tree), keyed by the parser's label.
const outletLogos: Record<string, string> = {
  'Vatican News': 'outlet-vatican-news.png',
  "L'Osservatore Romano": 'outlet-osservatore.png',
  'Radio Vaticana': 'outlet-radio-vaticana.png',
}
function outletImage(label: string): ImageSource | undefined {
  const file = outletLogos[label]
  // ?v busts expo-image's URL cache when a logo is regenerated at a fixed name.
  return file ? { uri: `${hearthUrl(`art/${file}`)}?v=7` } : undefined
}

function SubHeader({ children }: { children: ReactNode }) {
  return (
    <Typography variant="reference" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
      {children}
    </Typography>
  )
}

function VideoCard({ video, onPress }: { video: VnVideo; onPress: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={video.title}
    >
      <YStack width={208} gap="$sm">
        <YStack
          width={208}
          height={117}
          borderRadius={10}
          overflow="hidden"
          backgroundColor="$backgroundSurface"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            source={{ uri: video.thumb }}
            style={{ width: 208, height: 117 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <YStack
            position="absolute"
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="rgba(0,0,0,0.55)"
            alignItems="center"
            justifyContent="center"
          >
            <Typography color="#F5EFE2" fontSize={20} lineHeight={20}>
              ▶
            </Typography>
          </YStack>
        </YStack>
        <YStack gap={2}>
          <Typography variant="reference" tone="muted">
            {video.date}
          </Typography>
          <Typography variant="whisper" fontSize="$2" numberOfLines={2} color="$color">
            {video.title}
          </Typography>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

export function FromRome() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const lang = vaticanWidgetLang(i18n.language)
  const [videoId, setVideoId] = useState<string | undefined>()

  const { data, isError } = useQuery({
    queryKey: ['vatican-news', lang],
    queryFn: () => fetchVaticanNews(lang),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  })
  // One RSS fetch → article-URL → thumbnail. Native only (the feed isn't
  // CORS-enabled); tiles whose URL isn't in the map keep their solid tone.
  const { data: newsImages } = useQuery({
    queryKey: ['vatican-news-images', lang],
    queryFn: () => fetchNewsImages(lang),
    enabled: Platform.OS !== 'web',
    staleTime: 15 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 0,
  })

  const label = (
    <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
      {t('explore.fromRome')}
    </Typography>
  )

  const empty =
    data && data.news.length === 0 && data.videos.length === 0 && data.holySee.length === 0
  // Parse failed / unavailable → degrade to the official embed, never break.
  if (isError || empty) {
    return (
      <YStack gap="$sm">
        {label}
        <VaticanNews />
      </YStack>
    )
  }
  if (!data) {
    return <YStack gap="$sm">{label}</YStack>
  }

  const openArticle = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener')
      return
    }
    // Native in-app browser (SFSafariViewController / Custom Tabs): full-screen,
    // swipe-to-dismiss, share/reader — the Telegram-style experience. Themed.
    WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: theme.accent?.val,
      toolbarColor: theme.background?.val,
    })
  }
  const openVideo = (id: string) => setVideoId(id)
  const newsHub = `https://www.vaticannews.va/${lang}.html`
  const featured = data.featured

  return (
    <YStack gap="$lg">
      {label}

      {data.videos.length > 0 && (
        <YStack gap="$sm">
          <SubHeader>{t('explore.rome.videos')}</SubHeader>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          >
            {data.videos.map((v) => (
              <VideoCard key={v.id} video={v} onPress={() => openVideo(v.id)} />
            ))}
          </ScrollView>
        </YStack>
      )}

      {(featured || data.news.length > 0) && (
        <YStack gap="$sm">
          <SubHeader>{t('explore.rome.news')}</SubHeader>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          >
            {(featured ? [featured, ...data.news] : data.news).slice(0, 10).map((it, i) => (
              <NewsTile
                key={it.url}
                item={it}
                tone={toneByIndex(i)}
                image={newsImages?.[it.url]}
                onPress={() => openArticle(it.url)}
              />
            ))}
          </ScrollView>
          <AnimatedPressable
            onPress={() => openArticle(newsHub)}
            accessibilityRole="link"
            accessibilityLabel={t('explore.rome.more')}
          >
            <Typography variant="reference" color="$accent" paddingVertical="$sm">
              {t('explore.rome.more')} →
            </Typography>
          </AnimatedPressable>
        </YStack>
      )}

      {data.holySee.length > 0 && (
        <YStack gap="$sm">
          <SubHeader>{t('explore.rome.holySee')}</SubHeader>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14, alignItems: 'stretch' }}
          >
            {data.holySee.slice(0, 10).map((it, i) => (
              <HolySeeCard
                key={it.url}
                item={it}
                tone={toneByIndex(i + 2)}
                onPress={() => openArticle(it.url)}
              />
            ))}
          </ScrollView>
        </YStack>
      )}

      {data.outlets.length > 0 && (
        <YStack gap="$sm">
          <SubHeader>{t('explore.rome.media')}</SubHeader>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -24 }}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          >
            {data.outlets.map((o, i) => (
              <ArtCoverCard
                key={o.url}
                title={o.label}
                image={outletImage(o.label)}
                tone={toneByIndex(i + 1)}
                onPress={() => openArticle(o.url)}
              />
            ))}
          </ScrollView>
        </YStack>
      )}

      {/* Native bottom sheet (@expo/ui): SwiftUI .sheet on iOS, Material3 on
          Android — swipe-to-dismiss, fills, native grabber. index -1 = closed. */}
      {/* Content-sized sheet: hugs the 16:9 video at the top instead of filling
          the screen. No snapPoints → enableDynamicSizing measures the explicit
          height, so it sits as a compact bottom sheet. */}
      <BottomSheet
        index={videoId ? 0 : -1}
        enablePanDownToClose
        onClose={() => setVideoId(undefined)}
        backgroundStyle={{ backgroundColor: '#000' }}
      >
        <YStack backgroundColor="#000" paddingTop="$md" paddingBottom="$xl">
          {videoId && (
            <YStack width="100%" height={Math.round((width * 9) / 16)}>
              <YouTubePlayer videoId={videoId} />
            </YStack>
          )}
        </YStack>
      </BottomSheet>
    </YStack>
  )
}
