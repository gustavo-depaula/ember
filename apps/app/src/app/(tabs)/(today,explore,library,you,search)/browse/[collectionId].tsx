import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { CollectionItemManifest } from '@/content/manifestTypes'
import { CollectionHero, PrologueProse, SectionList } from '@/features/collections'
import { artFor } from '@/features/explore/artMap'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'
import { useNowPlayingClearance } from '@/stores/creatorsStore'

const nativeTabBarClearance = 56

/** Quiet placeholder while an unwarmed collection's manifest fetches. */
function CollectionSkeleton() {
  return (
    <YStack gap="$md" opacity={0.5}>
      <YStack height={14} width="40%" borderRadius={4} backgroundColor="$backgroundSurface" />
      <XStack gap="$md">
        {[0, 1, 2].map((i) => (
          <YStack
            key={i}
            width={150}
            aspectRatio={1.6}
            borderRadius={6}
            backgroundColor="$backgroundSurface"
          />
        ))}
      </XStack>
    </YStack>
  )
}

export default function CollectionDetailScreen() {
  const { collectionId: bareId } = useLocalSearchParams<{ collectionId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const nowPlaying = useNowPlayingClearance()

  // Drive the hero's stretch-on-pull-down off the scroll offset.
  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const collectionId = `collection/${bareId}`
  const collectionEntry = getEntry(collectionId)

  // Fetch the manifest eagerly on mount (rather than waiting on the background
  // warmer), so an unwarmed collection resolves fast and shows a skeleton.
  const { data: manifest, isPending } = useQuery({
    queryKey: ['collection-manifest', collectionEntry?.hash],
    queryFn: () => ensureManifestBody<CollectionItemManifest>(collectionEntry?.hash ?? ''),
    enabled: !!collectionEntry,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const sections = manifest?.sections
  const background = theme.background?.val ?? '#000000'

  if (!collectionEntry) {
    return (
      <YStack flex={1} backgroundColor="$background" paddingTop={insets.top + 48} padding="$lg">
        <Typography variant="interface" tone="muted">
          {t('browse.collectionNotFound')}
        </Typography>
      </YStack>
    )
  }

  const name = collectionEntry.name ? localizeContent(collectionEntry.name) : (bareId ?? '')
  const tagline = collectionEntry.description
    ? localizeContent(collectionEntry.description)
    : undefined
  const prologue = manifest?.prologue ? localizeContent(manifest.prologue.body) : undefined

  return (
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying }}
      contentInsetAdjustmentBehavior="never"
    >
      <CollectionHero
        collectionId={collectionId}
        name={name}
        tagline={tagline}
        image={artFor(collectionId)}
        tone={toneByIndex(toneIndexForId(collectionId))}
        scrollY={scrollY}
      />

      {/* Opaque column over the hero's lower bleed; holds the reading content. */}
      <YStack
        width="100%"
        maxWidth={640}
        alignSelf="center"
        paddingHorizontal="$lg"
        paddingTop="$lg"
        gap="$lg"
        backgroundColor="$background"
      >
        {prologue && <PrologueProse text={prologue} />}

        {sections && sections.length > 0 && (
          <SectionList collectionId={collectionId} sections={sections} />
        )}

        {!sections && isPending && <CollectionSkeleton />}
      </YStack>
    </Animated.ScrollView>
  )
}
