import { Stack } from 'expo-router'
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  Church,
  CircleDot,
  Compass,
  Flame,
  Library as LibraryIcon,
  Mic2,
  Music,
  ShieldCheck,
  Skull,
  Sparkle,
  Sun,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PageFlourish, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { flags } from '@/config/flags'
import { bareId, getEntriesByKind } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { SearchAutocomplete } from '@/features/practices/components'
import { ShortcutGrid, type ShortcutTileData, WideShortcutCard } from '@/features/search'
import { localizeContent } from '@/lib/i18n'

const flourishDark = require('../../../../assets/textures/notch_search_dark.png')
const flourishLight = require('../../../../assets/textures/notch_search_light.png')
const flourishAspect = 2172 / 478
const flourishLightAspect = 2153 / 334

// Search tab: the iOS 26 header search bar morphs out of the tab. With a query
// it runs live corpus search (practices/books/collections); empty, it's the
// illuminated portfolio — a jewel-toned grid of shortcuts into every feature,
// the Bible, the catechism, and the living collections of the corpus.
export default function SearchScreen() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const catalogVersion = useCatalogVersion()

  const isSearching = query.trim().length > 0

  // The native search bar must be configured ONCE, not on every keystroke.
  // `query` state lives in this component, so each character re-renders it; if
  // the screen options (and `onChangeText` closure) are recreated inline they
  // re-commit the search bar, and on iOS 26 repeated reconfiguration makes the
  // field abandon its integrated bottom-bar slot and jump to the nav bar (top).
  // A stable callback + memoized options keep it pinned to the bottom.
  const onSearchChange = useCallback(
    (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
    [],
  )
  const screenOptions = useMemo(
    () => ({
      // The shared group hides headers by default; the search portfolio is the
      // one screen that needs the native header to host the iOS 26 search bar
      // that morphs out of the search tab.
      headerShown: true,
      headerTransparent: true,
      headerTitle: '',
      // Search's nav-bar context triggers iOS 26's automatic top scroll-edge
      // effect — a soft gradient over the notch atop the flourish. Hide it.
      scrollEdgeEffects: { top: 'hidden' as const },
      headerSearchBarOptions: {
        // Pin to the iOS 26 integrated placement so the field stays in the
        // bottom Liquid Glass bar instead of `automatic` drifting it to the top.
        placement: 'integrated' as const,
        placeholder: t('nav.searchPlaceholder'),
        onChangeText: onSearchChange,
      },
    }),
    [t, onSearchChange],
  )

  const prayTiles: ShortcutTileData[] = [
    {
      key: 'mass',
      title: t('home.holyMass'),
      icon: Church,
      href: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
    },
    { key: 'bible', title: t('home.bible'), icon: BookOpen, href: '/bible' },
    { key: 'oratio', title: t('oratio.title'), icon: Flame, href: '/oratio' },
    { key: 'kyrie', title: t('kyrie.title'), icon: CircleDot, href: '/kyrie' },
    {
      key: 'examen',
      title: t('examen.title'),
      icon: Compass,
      href: {
        pathname: '/pray/[practiceId]',
        params: { practiceId: 'examination-of-conscience' },
      },
    },
    { key: 'memento', title: t('memento.title'), icon: Skull, href: '/memento' },
  ]

  const studyTiles: ShortcutTileData[] = [
    {
      key: 'catechism',
      title: t('catechism.title'),
      icon: BookMarked,
      href: { pathname: '/browse/book/[bookId]/read', params: { bookId: 'ccc' } },
    },
    { key: 'saints', title: t('saints.title'), icon: Sparkle, href: '/saints' },
    { key: 'creators', title: t('creators.title'), icon: Mic2, href: '/creators' },
    { key: 'calendar', title: t('calendar.title'), icon: CalendarDays, href: '/calendar' },
    { key: 'diesDomini', title: t('diesDomini.title'), icon: Sun, href: '/dies-domini' },
    { key: 'piano', title: t('piano.title'), icon: Music, href: '/piano' },
    ...(flags.custody
      ? [{ key: 'custody', title: t('you.custody'), icon: ShieldCheck, href: '/custody' } as const]
      : []),
  ]

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred collection manifests warm in.
  const libraryTiles = useMemo<ShortcutTileData[]>(() => {
    // Only collections with mapped art read as deliberate cover tiles — that set
    // is exactly the curated, non-meta collections, so no extra filtering needed.
    const collections = getEntriesByKind('collection')
      .map(([id, entry]) => ({ id, image: artFor(id), entry }))
      .filter((c) => c.image)
      .slice(0, 6)
      .map<ShortcutTileData>(({ id, image, entry }) => ({
        key: id,
        title: entry.name ? localizeContent(entry.name) : bareId(id),
        image,
        href: { pathname: '/browse/[collectionId]', params: { collectionId: bareId(id) } },
      }))
    return [
      ...collections,
      {
        key: 'all-collections',
        title: t('search.collectionsTitle'),
        icon: LibraryIcon,
        href: '/browse/all',
      },
    ]
  }, [catalogVersion, t])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred book manifests warm in.
  const bookTiles = useMemo<ShortcutTileData[]>(() => {
    const books = getEntriesByKind('book')
      .filter(([id]) => !/example|starter|sandbox/.test(id))
      .slice(0, 5)
      .map<ShortcutTileData>(([id, entry]) => ({
        key: id,
        title: localizeContent(entry.name ?? entry.title ?? {}),
        image: artFor(id),
        icon: BookOpen,
        href: { pathname: '/browse/book/[bookId]', params: { bookId: bareId(id) } },
      }))
    if (books.length === 0) return books
    return [
      ...books,
      { key: 'all-books', title: t('search.booksTitle'), icon: LibraryIcon, href: '/browse/books' },
    ]
  }, [catalogVersion, t])

  // Each tile keeps a stable hue keyed on its identity, not its position.
  const withTones = (tiles: ShortcutTileData[]): ShortcutTileData[] =>
    tiles.map((tile) => ({ ...tile, tone: toneForKey(tile.key) }))

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <ScreenLayout>
        {!isSearching && (
          <PageFlourish
            dark={flourishDark}
            light={flourishLight}
            aspectRatio={flourishAspect}
            lightAspectRatio={flourishLightAspect}
          />
        )}
        {isSearching ? (
          <YStack paddingVertical="$lg">
            <SearchAutocomplete query={query} />
          </YStack>
        ) : (
          <YStack gap="$xl" paddingTop="$sm" paddingBottom="$lg">
            <PageHeader title={t('nav.searchPlaceholder')} />
            <WideShortcutCard
              title={t('massTimes.cardTitle')}
              subtitle={t('massTimes.exploreTagline')}
              icon={Church}
              tone={toneForKey('mass-times')}
              href="/mass-times"
            />
            <Section title={t('search.sectionPray')}>
              <ShortcutGrid items={withTones(prayTiles)} />
            </Section>
            <Section title={t('search.sectionStudy')}>
              <ShortcutGrid items={withTones(studyTiles)} />
            </Section>
            {bookTiles.length > 0 && (
              <Section title={t('search.sectionRead')}>
                <ShortcutGrid items={withTones(bookTiles)} />
              </Section>
            )}
            <Section title={t('search.sectionCollections')}>
              <ShortcutGrid items={withTones(libraryTiles)} />
            </Section>
          </YStack>
        )}
      </ScreenLayout>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$md">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {title}
      </Typography>
      {children}
    </YStack>
  )
}
