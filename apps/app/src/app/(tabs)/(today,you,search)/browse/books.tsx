import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, Typography } from '@/components'
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

// The list is one column of these: a shelf's label, then its books three to a
// line. A FlatList can't mix headers into `numColumns`, so lines are built here.
type Line =
  | { kind: 'shelf'; key: string; title: string; count: number }
  | { kind: 'books'; key: string; books: BookRow[]; showAuthor: boolean }

// An author with fewer books than this shares the closing shelf, so the screen
// isn't a run of one-book shelves.
const ownShelfFrom = 4

// Shelves of book-shaped covers, one per author, virtualized: every generated cover is an SVG,
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
  const lines = useMemo<Line[]>(() => {
    // Shelved by author — keyed on the English name, so a half-translated
    // corpus doesn't split one author across two shelves.
    const byAuthor = new Map<string, { name: string; books: BookRow[] }>()
    for (const [id, entry] of getEntriesByKind('book')) {
      if (/example|starter|sandbox/.test(id)) continue
      const authorText = entry.author as Record<string, string> | undefined
      const author = authorText ? localizeContent(authorText) : ''
      const shelfKey = authorText?.['en-US'] ?? author
      const shelf = byAuthor.get(shelfKey) ?? { name: author, books: [] }
      shelf.books.push({
        id,
        bareId: bareId(id),
        title: localizeContent(entry.name ?? entry.title ?? {}) || bareId(id),
        author: author || undefined,
        cover: coverFor(entry),
      })
      byAuthor.set(shelfKey, shelf)
    }
    const byTitle = (a: BookRow, b: BookRow) => a.title.localeCompare(b.title)
    const own = [...byAuthor.values()].filter((a) => a.name && a.books.length >= ownShelfFrom)
    const rest = [...byAuthor.values()].filter((a) => !own.includes(a)).flatMap((a) => a.books)
    const shelves = [
      ...own.sort((a, b) => a.name.localeCompare(b.name)),
      { name: t('browse.otherAuthors'), books: rest, mixed: true },
    ].filter((shelf) => shelf.books.length > 0)

    return shelves.flatMap((shelf, i) => {
      const books = shelf.books.sort(byTitle)
      const out: Line[] = [
        { kind: 'shelf', key: `shelf-${i}`, title: shelf.name, count: books.length },
      ]
      for (let at = 0; at < books.length; at += columns)
        out.push({
          kind: 'books',
          key: books[at].id,
          books: books.slice(at, at + columns),
          // Under an author's own name the byline would only repeat the label.
          showAuthor: 'mixed' in shelf,
        })
      return out
    })
  }, [catalogVersion, t])

  const renderItem = useCallback(
    ({ item }: { item: Line }) =>
      item.kind === 'shelf' ? (
        <XStack alignItems="baseline" gap="$sm" paddingTop="$lg">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5} flexShrink={1}>
            {item.title}
          </Typography>
          <Typography variant="annotation">{item.count}</Typography>
        </XStack>
      ) : (
        <XStack gap={gutter}>
          {item.books.map((b) => (
            <ArtCoverCard
              key={b.id}
              title={b.title}
              subtitle={item.showAuthor ? b.author : undefined}
              image={artFor(b.id)}
              tone={toneForKey(b.id)}
              cover={b.cover}
              size={size}
              aspectRatio={1.5}
              radius={6}
              href={{ pathname: '/browse/book/[bookId]', params: { bookId: b.bareId } }}
            />
          ))}
        </XStack>
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
        data={lines}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={RowGap}
        ListHeaderComponent={
          <YStack paddingTop="$lg">
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
        initialNumToRender={6}
        // windowSize alone bounds what is mounted. No removeClippedSubviews:
        // on iOS it detaches a row while its lower part is still on screen,
        // leaving a blank band at the top of the shelf.
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyExtractor = (line: Line) => line.key

function RowGap() {
  return <YStack height={gutter} />
}
