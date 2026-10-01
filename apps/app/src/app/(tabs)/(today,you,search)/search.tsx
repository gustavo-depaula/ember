import { type NativeStackNavigationProp, Stack, useNavigation } from 'expo-router'
import {
  BookMarked,
  BookOpen,
  Church,
  CircleDot,
  Flame,
  Library as LibraryIcon,
  Music,
  Sparkle,
} from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchBarCommands } from 'react-native-screens'
import { YStack } from 'tamagui'

import { PageFlourish, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import { bareId, getEntriesByKind } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { ExploreCatalogRows, LibraryRow } from '@/features/explore'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { SearchAutocomplete } from '@/features/practices/components'
import { ShortcutGrid, type ShortcutTileData, WideShortcutCard } from '@/features/search'
import { useDeferredTabMount } from '@/hooks/useDeferredTabMount'
import { localizeContent } from '@/lib/i18n'

const flourishDark = require('../../../../assets/textures/notch_search_dark.png')
const flourishLight = require('../../../../assets/textures/notch_search_light.png')
const flourishAspect = 2172 / 478
const flourishLightAspect = 2153 / 334

// With a query, live corpus search; empty, the portfolio of shortcuts and
// browsable catalogue rows.
export default function SearchScreen() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const catalogVersion = useCatalogVersion()
  // Only the body waits; the screen options stay mounted so the native search
  // bar is configured from launch.
  const bodyMounted = useDeferredTabMount()

  const isSearching = query.trim().length > 0

  const searchBar = useRef<SearchBarCommands>(null)
  const typed = useRef('')
  // Configure the native search bar once, not per keystroke: options recreated
  // on each render re-commit it, and on iOS 26 repeated reconfiguration makes
  // the field abandon its integrated bottom-bar slot and jump to the nav bar.
  const onSearchChange = useCallback((e: { nativeEvent: { text: string } }) => {
    typed.current = e.nativeEvent.text
    setQuery(e.nativeEvent.text)
  }, [])
  // Opening a result covers this screen, and on the way back UIKit empties the
  // search field without a change event, leaving results under a blank field.
  // Write the term back once the return transition ends: UIKit also wipes
  // anything set earlier, on focus.
  const navigation = useNavigation<NativeStackNavigationProp<Record<string, undefined>>>()
  useEffect(
    () =>
      navigation.addListener('transitionEnd', (e) => {
        if (!e.data.closing && typed.current) searchBar.current?.setText(typed.current)
      }),
    [navigation],
  )
  const screenOptions = useMemo(
    () => ({
      // The shared group hides headers; this screen needs the native header to
      // host the iOS 26 search bar.
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
        ref: searchBar,
        placeholder: t('nav.searchPlaceholder'),
        onChangeText: onSearchChange,
      },
    }),
    [t, onSearchChange],
  )

  const prayTiles = useMemo<ShortcutTileData[]>(
    () => [
      {
        key: 'mass',
        title: t('home.holyMass'),
        icon: Church,
        href: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
      },
      { key: 'bible', title: t('home.bible'), icon: BookOpen, href: '/bible' },
      { key: 'oratio', title: t('oratio.title'), icon: Flame, href: '/oratio' },
      { key: 'kyrie', title: t('kyrie.title'), icon: CircleDot, href: '/kyrie' },
    ],
    [t],
  )

  const studyTiles = useMemo<ShortcutTileData[]>(
    () => [
      {
        key: 'catechism',
        title: t('catechism.title'),
        icon: BookMarked,
        href: { pathname: '/browse/book/[bookId]/read', params: { bookId: 'ccc' } },
      },
      { key: 'saints', title: t('saints.title'), icon: Sparkle, href: '/saints' },
      { key: 'piano', title: t('piano.title'), icon: Music, href: '/piano' },
    ],
    [t],
  )

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

  // Memoized and hidden rather than unmounted while a query is typed: each
  // keystroke re-renders this screen, and remounting the tiles when the query
  // is cleared took ~200ms.
  const browse = useMemo(() => {
    // Each tile keeps a stable hue keyed on its identity, not its position.
    const withTones = (tiles: ShortcutTileData[]): ShortcutTileData[] =>
      tiles.map((tile) => ({ ...tile, tone: toneForKey(tile.key) }))
    return (
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
        <LibraryRow />
        <Section title={t('search.sectionCollections')}>
          <ShortcutGrid items={withTones(libraryTiles)} />
        </Section>
        <ExploreCatalogRows />
      </YStack>
    )
  }, [t, prayTiles, studyTiles, libraryTiles])

  return (
    <>
      <Stack.Screen options={screenOptions} />
      {bodyMounted && (
        <ScreenLayout>
          {!isSearching && (
            <PageFlourish
              dark={flourishDark}
              light={flourishLight}
              aspectRatio={flourishAspect}
              lightAspectRatio={flourishLightAspect}
            />
          )}
          {isSearching && (
            <YStack paddingVertical="$lg">
              <SearchAutocomplete query={query} />
            </YStack>
          )}
          <YStack display={isSearching ? 'none' : 'flex'}>{browse}</YStack>
        </ScreenLayout>
      )}
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
