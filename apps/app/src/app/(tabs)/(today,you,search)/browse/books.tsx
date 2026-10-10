import { Stack, useLocalSearchParams } from 'expo-router'
import { type RefObject, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import {
  HubFrame,
  PageHeader,
  RailLink,
  Typography,
  useGridCells,
  useWidthClass,
} from '@/components'
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

// One list, three shapes: on a phone every shelf as a carousel, or one shelf's
// books three to a line; on a wide window every shelf under its heading, its
// books standing in rows.
type Line =
  | { kind: 'shelf'; key: string; shelf: Shelf }
  | { kind: 'heading'; key: string; shelf: Shelf }
  | { kind: 'books'; key: string; books: BookRow[]; showAuthor: boolean; last: boolean }

// An author with fewer books than this shares the closing shelf, so the screen
// isn't a run of one-book shelves.
const ownShelfFrom = 4
const otherAuthorsKey = 'other'
// A carousel shows this many covers; past it, the label's arrow opens the whole shelf.
const carouselSize = 12

// Three covers fit a phone comfortably; a wider page takes more at the
// carousel's size.
const phoneColumns = 3
const gutter = 14
const carouselCover = 118

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

// Every book, one carousel per author; with `author`, that one shelf in full.
export default function AllBooksScreen() {
  const { t } = useTranslation()
  const { author: openShelf } = useLocalSearchParams<{ author?: string }>()
  const catalogVersion = useCatalogVersion()
  const list = useRef<FlatList<Line>>(null)
  const { medium } = useWidthClass()

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
  const title = opened?.name ?? t('pray.allBooks')

  return (
    <HubFrame
      index={
        opened || !medium
          ? undefined
          : shelves.map((shelf) => (
              <RailLink
                key={shelf.key}
                label={shelf.name}
                onPress={() => scrollToShelf(list, shelf.key)}
              />
            ))
      }
    >
      <Stack.Screen options={{ title }} />
      <BookList list={list} shelves={shelves} opened={opened} title={title} grid={medium} />
    </HubFrame>
  )
}

function scrollToShelf(list: RefObject<FlatList<Line> | null>, key: string) {
  const lines = list.current?.props.data as Line[] | undefined
  const index = lines?.findIndex((line) => line.kind === 'heading' && line.key === key) ?? -1
  if (index >= 0) list.current?.scrollToIndex({ index, animated: true })
}

// Inside the frame, so the covers size from the list's own column.
function BookList({
  list,
  shelves,
  opened,
  title,
  grid,
}: {
  list: RefObject<FlatList<Line> | null>
  shelves: Shelf[]
  opened: Shelf | undefined
  title: string
  grid: boolean
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { columns, cell: size } = useGridCells(carouselCover, gutter, phoneColumns)

  const lines = useMemo<Line[]>(() => {
    const rows = (shelf: Shelf): Line[] => {
      const out: Line[] = []
      for (let at = 0; at < shelf.books.length; at += columns)
        out.push({
          kind: 'books',
          key: shelf.books[at].id,
          books: shelf.books.slice(at, at + columns),
          showAuthor: shelf.mixed,
          last: at + columns >= shelf.books.length,
        })
      return out
    }
    if (opened) return rows(opened)
    if (!grid) return shelves.map((shelf) => ({ kind: 'shelf', key: shelf.key, shelf }))
    return shelves.flatMap((shelf) => [
      { kind: 'heading', key: shelf.key, shelf } as const,
      ...rows(shelf),
    ])
  }, [shelves, opened, grid, columns])

  const renderItem = useCallback(
    ({ item }: { item: Line }) => {
      if (item.kind === 'heading')
        return (
          <Typography
            variant="label"
            textTransform="uppercase"
            letterSpacing={1.5}
            paddingBottom="$sm"
          >
            {item.shelf.name}
          </Typography>
        )
      if (item.kind === 'books')
        return (
          // A shelf's last row closes it: the gap beneath is the one between shelves.
          <XStack gap={gutter} paddingBottom={item.last && !opened ? 28 : gutter}>
            {item.books.map((b) => (
              <BookCard key={b.id} book={b} size={size} showAuthor={item.showAuthor} />
            ))}
          </XStack>
        )
      return (
        <ArtCarousel
          title={item.shelf.name}
          href={
            item.shelf.books.length > carouselSize
              ? { pathname: '/browse/books', params: { author: item.shelf.key } }
              : undefined
          }
        >
          {item.shelf.books.slice(0, carouselSize).map((b) => (
            <BookCard key={b.id} book={b} size={carouselCover} showAuthor={item.shelf.mixed} />
          ))}
        </ArtCarousel>
      )
    },
    [size, opened],
  )

  return (
    // Not ScreenLayout: its unscrolled variant pads a fixed frame, clipping the
    // shelf under the status bar and above the tab bar. The list pads itself.
    <FlatList
      ref={list}
      style={{ flex: 1 }}
      // Rows vary in height with their titles, so a far shelf has no known
      // offset: land near it, then settle on it once it has been measured.
      onScrollToIndexFailed={({ index, averageItemLength }) => {
        list.current?.scrollToOffset({ offset: index * averageItemLength, animated: false })
        setTimeout(() => list.current?.scrollToIndex({ index, animated: false }), 80)
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + bottomClearance + 24,
      }}
      contentInsetAdjustmentBehavior="never"
      data={lines}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={grid || opened ? undefined : ShelfGap}
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

function ShelfGap() {
  return <YStack height={28} />
}
