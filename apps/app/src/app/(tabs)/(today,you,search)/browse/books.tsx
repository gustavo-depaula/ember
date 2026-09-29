import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'

import { PageHeader } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { getEntriesByKind } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, type TileCover } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type BookRow = {
  id: string
  bareId: string
  title: string
  author?: string
  cover?: TileCover
}

// A shelf of book-shaped covers, virtualized: every generated cover is an SVG,
// and mounting the whole catalog at once stalls the screen. ScreenLayout caps content at 640 and pads $lg
// (24) each side; three covers fit a phone comfortably, more on a wide column.
const columns = 3
const gutter = 14
function useCoverSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.floor((content - gutter * (columns - 1)) / columns)
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export default function AllBooksScreen() {
  const { t } = useTranslation()
  const size = useCoverSize()
  const catalogVersion = useCatalogVersion()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const books = useMemo<BookRow[]>(() => {
    const out: BookRow[] = []
    for (const [id, entry] of getEntriesByKind('book')) {
      if (/example|starter|sandbox/.test(id)) continue
      const author = entry.author ? localizeContent(entry.author as Record<string, string>) : ''
      out.push({
        id,
        bareId: bareId(id),
        title: localizeContent(entry.name ?? entry.title ?? {}) || bareId(id),
        author: author || undefined,
        cover: coverFor(entry),
      })
    }
    out.sort((a, b) => a.title.localeCompare(b.title))
    return out
  }, [catalogVersion])

  const renderItem = useCallback(
    ({ item: b }: { item: BookRow }) => (
      <ArtCoverCard
        title={b.title}
        subtitle={b.author}
        image={artFor(b.id)}
        tone={toneForKey(b.id)}
        cover={b.cover}
        size={size}
        aspectRatio={1.5}
        radius={6}
        href={{ pathname: '/browse/book/[bookId]', params: { bookId: b.bareId } }}
      />
    ),
    [size],
  )

  return (
    // Not ScreenLayout: its unscrolled variant pads a fixed frame, clipping the
    // shelf under the status bar and above the tab bar. The list pads itself.
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        data={books}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={columns}
        columnWrapperStyle={{ gap: gutter }}
        ItemSeparatorComponent={RowGap}
        ListHeaderComponent={
          <YStack paddingTop="$lg" paddingBottom="$lg">
            <PageHeader title={t('pray.allBooks')} />
          </YStack>
        }
        ListEmptyComponent={
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg" paddingHorizontal="$lg">
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {t('browse.emptyState')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
            >
              {t('browse.registryOffline')}
            </Text>
          </YStack>
        }
        initialNumToRender={12}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyExtractor = (b: BookRow) => b.id

function RowGap() {
  return <YStack height={gutter} />
}
