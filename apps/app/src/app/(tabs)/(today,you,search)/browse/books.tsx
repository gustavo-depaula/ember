import { Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { getEntriesByKind } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, type TileCover } from '@/features/covers'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
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

/** An author's books, or the closing shelf of everyone with too few for their own. */
type Shelf = { key: string; name: string; books: BookRow[]; mixed: boolean }

// One list, two shapes: every shelf as a carousel, or one shelf's books three to a line.
type Line =
  | { kind: 'shelf'; key: string; shelf: Shelf }
  | { kind: 'books'; key: string; books: BookRow[]; showAuthor: boolean }

// An author with fewer books than this shares the closing shelf, so the screen
// isn't a run of one-book shelves.
const ownShelfFrom = 4
const otherAuthorsKey = 'other'
// A carousel shows this many covers; past it, the label's arrow opens the whole shelf.
const carouselSize = 12

// ScreenLayout caps content at 640 and pads $lg (24) each side; three covers
// fit a phone comfortably, more on a wide column.
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

// Every book, one carousel per author; with `author`, that one shelf in full.
export default function AllBooksScreen() {
  const { t } = useTranslation()
  const { author: openShelf } = useLocalSearchParams<{ author?: string }>()
  const size = useCoverSize()
  const catalogVersion = useCatalogVersion()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const shelves = useMemo<Shelf[]>(() => {
    // Keyed on the English name, so a half-translated corpus doesn't split one
    // author across two shelves.
    const byAuthor = new Map<string, Shelf>()
    for (const [id, entry] of getEntriesByKind('book')) {
      if (/example|starter|sandbox/.test(id)) continue
      const authorText = entry.author as Record<string, string> | undefined
      const author = authorText ? localizeContent(authorText) : ''
      const key = authorText?.['en-US'] ?? author
      const shelf = byAuthor.get(key) ?? { key, name: author, books: [], mixed: false }
      shelf.books.push({
        id,
        bareId: bareId(id),
        title: localizeContent(entry.name ?? entry.title ?? {}) || bareId(id),
        author: author || undefined,
        cover: coverFor(entry),
      })
      byAuthor.set(key, shelf)
    }
    const own = [...byAuthor.values()].filter((a) => a.name && a.books.length >= ownShelfFrom)
    const rest = [...byAuthor.values()].filter((a) => !own.includes(a)).flatMap((a) => a.books)
    return [
      ...own.sort((a, b) => a.name.localeCompare(b.name)),
      { key: otherAuthorsKey, name: t('browse.otherAuthors'), books: rest, mixed: true },
    ]
      .filter((shelf) => shelf.books.length > 0)
      .map((shelf) => ({
        ...shelf,
        books: shelf.books.sort((a, b) => a.title.localeCompare(b.title)),
      }))
  }, [catalogVersion, t])

  const opened = openShelf ? shelves.find((s) => s.key === openShelf) : undefined
  const lines = useMemo<Line[]>(() => {
    if (!opened) return shelves.map((shelf) => ({ kind: 'shelf', key: shelf.key, shelf }))
    const out: Line[] = []
    for (let at = 0; at < opened.books.length; at += columns)
      out.push({
        kind: 'books',
        key: opened.books[at].id,
        books: opened.books.slice(at, at + columns),
        showAuthor: opened.mixed,
      })
    return out
  }, [shelves, opened])

  const renderItem = useCallback(
    ({ item }: { item: Line }) =>
      item.kind === 'shelf' ? (
        <ArtCarousel
          title={item.shelf.name}
          href={
            item.shelf.books.length > carouselSize
              ? { pathname: '/browse/books', params: { author: item.shelf.key } }
              : undefined
          }
        >
          {item.shelf.books.slice(0, carouselSize).map((b) => (
            <BookCard key={b.id} book={b} size={118} showAuthor={item.shelf.mixed} />
          ))}
        </ArtCarousel>
      ) : (
        <XStack gap={gutter}>
          {item.books.map((b) => (
            <BookCard key={b.id} book={b} size={size} showAuthor={item.showAuthor} />
          ))}
        </XStack>
      ),
    [size],
  )

  const title = opened?.name ?? t('pray.allBooks')

  return (
    // Not ScreenLayout: its unscrolled variant pads a fixed frame, clipping the
    // shelf under the status bar and above the tab bar. The list pads itself.
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title }} />
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
        ItemSeparatorComponent={opened ? RowGap : ShelfGap}
        ListHeaderComponent={
          <YStack paddingTop="$lg" paddingBottom="$lg">
            <PageHeader title={title} />
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
        // Every generated cover is an SVG; mounting the whole catalog at once
        // stalls the screen, so only a few shelves render ahead.
        initialNumToRender={4}
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

function BookCard({
  book,
  size,
  showAuthor,
}: {
  book: BookRow
  size: number
  showAuthor: boolean
}) {
  return (
    <ArtCoverCard
      title={book.title}
      // Under an author's own name the byline would only repeat the label.
      subtitle={showAuthor ? book.author : undefined}
      image={artFor(book.id)}
      tone={toneForKey(book.id)}
      cover={book.cover}
      size={size}
      aspectRatio={1.5}
      radius={6}
      href={{ pathname: '/browse/book/[bookId]', params: { bookId: book.bareId } }}
    />
  )
}

function RowGap() {
  return <YStack height={gutter} />
}

function ShelfGap() {
  return <YStack height={28} />
}
