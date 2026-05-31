import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { CollectionHero, SectionList } from '@/features/collections'
import { toneByIndex } from '@/features/explore/bgColor'
import { ManageCollectionSheet, userCollectionRef, useUserCollection } from '@/features/library'
import { useNowPlayingClearance } from '@/stores/creatorsStore'

const nativeTabBarClearance = 56

/**
 * The viewer for a user-authored collection. Same immersive chrome as a corpus
 * collection (CollectionHero + SectionList), fed from a locally-assembled
 * manifest. The hero carries a Save + Edit cluster (no offline — the content is
 * already local); Edit opens the manage sheet.
 */
export default function UserCollectionScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const nowPlaying = useNowPlayingClearance()
  const [managing, setManaging] = useState(false)

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const { data, isPending } = useUserCollection(collectionId)
  const background = theme.background?.val ?? '#000000'

  if (!data && !isPending) {
    return (
      <YStack flex={1} backgroundColor="$background" paddingTop={insets.top + 48} padding="$lg">
        <Typography variant="interface" tone="muted">
          {t('browse.collectionNotFound')}
        </Typography>
      </YStack>
    )
  }

  const collection = data?.collection
  const sections = data?.manifest.sections
  const hasItems = (data?.items.length ?? 0) > 0

  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying,
        }}
        contentInsetAdjustmentBehavior="never"
      >
        {collection && (
          <CollectionHero
            collectionId={userCollectionRef(collection.id)}
            kind="usercollection"
            name={collection.name}
            tagline={collection.description}
            tone={toneByIndex(collection.coverTone)}
            scrollY={scrollY}
            onEdit={() => setManaging(true)}
          />
        )}

        <YStack
          width="100%"
          maxWidth={640}
          alignSelf="center"
          paddingHorizontal="$lg"
          paddingTop="$lg"
          gap="$lg"
          backgroundColor="$background"
        >
          {hasItems && sections ? (
            <SectionList collectionId={userCollectionRef(collectionId)} sections={sections} />
          ) : (
            <YStack gap="$xs" paddingVertical="$sm">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t('collections.empty')}
              </Typography>
              <Typography variant="whisper">{t('collections.emptyHint')}</Typography>
            </YStack>
          )}
        </YStack>
      </Animated.ScrollView>

      <ManageCollectionSheet
        collectionId={collectionId}
        open={managing}
        onClose={() => setManaging(false)}
        onDeleted={() => router.back()}
      />
    </>
  )
}
