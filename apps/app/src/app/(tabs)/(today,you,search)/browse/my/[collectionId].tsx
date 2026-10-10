import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, YStack } from 'tamagui'
import { PageColumn } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { Typography } from '@/components/typography'
import { CollectionHero, SectionList } from '@/features/collections'
import { userCollectionCover } from '@/features/covers'
import { toneByIndex } from '@/features/explore/bgColor'
import {
  favoritesId,
  favoritesTone,
  ManageCollectionSheet,
  userCollectionRef,
  useUserCollection,
} from '@/features/library'

/**
 * A user-authored collection, fed from a locally-assembled manifest. The hero
 * has no offline action — the content is already local. Favorites opens here
 * too, with nothing to manage: its star is on each prayer and book.
 */
export default function UserCollectionScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
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
  const isFavorites = collectionId === favoritesId

  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + bottomClearance,
        }}
        contentInsetAdjustmentBehavior="never"
      >
        {collection && (
          <CollectionHero
            collectionId={userCollectionRef(collection.id)}
            kind="usercollection"
            name={collection.name}
            tagline={collection.description}
            cover={userCollectionCover}
            tone={isFavorites ? favoritesTone : toneByIndex(collection.coverTone)}
            scrollY={scrollY}
            onEdit={isFavorites ? undefined : () => setManaging(true)}
          />
        )}

        <PageColumn measure="wide" paddingTop="$lg" gap="$lg" backgroundColor="$background">
          {hasItems && sections ? (
            <SectionList collectionId={userCollectionRef(collectionId)} sections={sections} />
          ) : (
            <YStack gap="$xs" paddingVertical="$sm">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t('collections.empty')}
              </Typography>
              <Typography variant="whisper">
                {isFavorites ? t('library.favoritesEmptyHint') : t('collections.emptyHint')}
              </Typography>
            </YStack>
          )}
        </PageColumn>
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
