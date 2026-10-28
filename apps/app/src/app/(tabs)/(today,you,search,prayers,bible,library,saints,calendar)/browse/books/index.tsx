import { format, parseISO, subDays } from 'date-fns'
import { Stack } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import {
  ageOf,
  arrivals,
  BookThumb,
  commentaries,
  LinkRow,
  ShelfCover,
  ShelfLabel,
  shortReads,
  useShelf,
} from '@/features/books/shelf'
import { collectionHref } from '@/features/collections'
import { coverFor, GeneratedCover } from '@/features/covers'
import { ArtCarousel } from '@/features/explore/ArtCarousel'
import { toneForKey } from '@/features/explore/bgColor'
import { BookFan, Door, ImageFan } from '@/features/explore/Door'
import { evangelistArtFor } from '@/features/explore/evangelistArt'
import { useHeldCards, useSaintsCatalog } from '@/features/saints'
import { useStableToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

// How far back "Recém-chegados" looks, and how many of them the front page shows.
const arrivalWindowDays = 60
const arrivalsShown = 12
const carouselCover = 118

// The written lists, in the order they're offered.
const lists = ['collection/first-books', 'collection/a-page-a-day']

// Whole works too large for the front page, each its own collection.
const completeCollections = [
  'collection/church-fathers',
  'collection/thomas-aquinas',
  'collection/denis-the-carthusian',
  'collection/papal-magisterium',
]

// The faces on the Autores door, and the books on the Épocas door: one from each age.
const doorAuthors = ['augustine', 'thomas-aquinas', 'francis-de-sales']
const doorBooks = [
  'book/miscellaneous-didache',
  'book/aquinas-summa-theologica-new-advent',
  'book/sales-introduction-to-the-devout-life',
]

/**
 * The Books screen: what arrived, a few lists, three doors into the catalogue
 * (the Bible commented book by book, the authors, the ages), and the complete
 * collections. Everything on it comes from the catalog's book hints, so a new
 * book or translation shows up without a release.
 */
export default function BooksScreen() {
  const { t, i18n } = useTranslation()
  const shelf = useShelf()
  const today = useStableToday()
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()

  const since = format(subDays(today, arrivalWindowDays), 'yyyy-MM-dd')
  const recent = useMemo(
    () => arrivals(shelf.books, i18n.language, since).slice(0, arrivalsShown),
    [shelf.books, i18n.language, since],
  )
  const short = useMemo(() => shortReads(shelf.books), [shelf.books])
  const commented = useMemo(() => commentaries(shelf.books, () => undefined).size, [shelf.books])
  const agesPresent = new Set(
    shelf.authors.flatMap((a) => (a.century ? [ageOf(a.century)?.id] : [])),
  ).size

  const faces = doorAuthors.flatMap((id) => {
    const saint = byId[shelf.authorById.get(id)?.saint ?? '']
    return saint ? [held.has(saint.id) ? saint.cardThumb : saint.printThumb] : []
  })
  const evangelists = ['Matthew', 'Luke', 'John'].flatMap((name) => {
    const art = evangelistArtFor(name, 0)
    return art ? [art] : []
  })

  return (
    <ScreenLayout measure="wide">
      <Stack.Screen options={{ title: t('pray.allBooks') }} />
      <YStack gap="$xl" paddingVertical="$lg">
        <PageHeader title={t('pray.allBooks')} />

        {shelf.books.length === 0 ? (
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg">
            <Typography variant="sacred-title" fontSize="$3" textAlign="center">
              {t('browse.emptyState')}
            </Typography>
            <Typography variant="caption" textAlign="center">
              {t('browse.registryOffline')}
            </Typography>
          </YStack>
        ) : null}

        {recent.length > 0 ? (
          <ArtCarousel title={t('shelf.arrivals')} href="/browse/books/new">
            {recent.map((arrival) => (
              <ShelfCover
                key={`${arrival.kind}-${arrival.book.id}`}
                book={arrival.book}
                size={carouselCover}
                subtitle={`${t(arrival.kind === 'new' ? 'shelf.newBook' : 'shelf.nowInLanguage')} · ${formatLocalized(parseISO(arrival.date), 'd MMM')}`}
              />
            ))}
          </ArtCarousel>
        ) : null}

        <YStack gap="$sm">
          <ShelfLabel>{t('shelf.lists')}</ShelfLabel>
          {lists.map((id) => (
            <ListLink key={id} id={id} />
          ))}
          {short[0] ? (
            <LinkRow
              thumb={<BookThumb book={short[0]} />}
              title={t('shelf.shortReads')}
              detail={t('shelf.shortReadsDetail', { count: short.length })}
              href="/browse/books/short"
            />
          ) : null}
        </YStack>

        <YStack gap="$md">
          <ShelfLabel>{t('shelf.explore')}</ShelfLabel>
          <Door
            count={commented}
            title={t('shelf.bible')}
            subtitle={t('shelf.bibleDetail')}
            href="/browse/books/bible"
          >
            <ImageFan images={evangelists} />
          </Door>
          <Door
            count={shelf.authors.length}
            title={t('shelf.authors')}
            subtitle={t('shelf.authorsDetail')}
            href="/browse/books/authors"
          >
            <ImageFan images={faces} />
          </Door>
          <Door
            count={agesPresent}
            title={t('shelf.ages')}
            subtitle={t('shelf.agesDetail')}
            href="/browse/books/ages"
          >
            <BookFan ids={doorBooks} />
          </Door>
        </YStack>

        <YStack gap="$sm">
          <ShelfLabel>{t('shelf.collections')}</ShelfLabel>
          {completeCollections.map((id) => (
            <CollectionLink key={id} id={id} />
          ))}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

function ListLink({ id }: { id: string }) {
  const entry = getEntry(id)
  if (!entry) return null
  const name = localizeContent((entry.name ?? {}) as Record<string, string>)
  return (
    <LinkRow
      thumb={<EntryThumb id={id} entry={entry} title={name} />}
      title={name}
      detail={localizeContent((entry.description ?? {}) as Record<string, string>)}
      href={{
        pathname: '/browse/books/list/[listId]',
        params: { listId: id.slice(id.indexOf('/') + 1) },
      }}
    />
  )
}

function CollectionLink({ id }: { id: string }) {
  const { t } = useTranslation()
  const entry = getEntry(id)
  if (!entry) return null
  const name = localizeContent((entry.name ?? {}) as Record<string, string>)
  const works = entry.itemCounts?.book ?? entry.itemCount ?? 0
  return (
    <LinkRow
      thumb={<EntryThumb id={id} entry={entry} title={name} />}
      title={name}
      // A single volume holding a whole corpus (the Magisterium's 2,044 documents)
      // says what it is rather than "1 work"; the description's Markdown emphasis is dropped.
      detail={
        works > 1
          ? t('shelf.works', { count: works })
          : localizeContent((entry.description ?? {}) as Record<string, string>).replaceAll('*', '')
      }
      href={collectionHref(id)}
    />
  )
}

function EntryThumb({ id, entry, title }: { id: string; entry: CatalogEntry; title: string }) {
  const cover = coverFor(entry)
  if (!cover) return null
  return <GeneratedCover cover={cover} title={title} tone={toneForKey(id)} width={44} />
}
