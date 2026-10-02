import { type NativeStackNavigationProp, Stack, useNavigation } from 'expo-router'
import { BookOpen, Church, Search, Sparkle, X } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import type { SearchBarCommands } from 'react-native-screens'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageFlourish, PageHeader, ScreenLayout } from '@/components'
import { SearchInput } from '@/components/SearchInput'
import { getEntry } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { toneForKey } from '@/features/explore/bgColor'
import { SearchAutocomplete } from '@/features/practices/components'
import {
  Acervo,
  RecentRow,
  ShortcutGrid,
  type ShortcutTileData,
  WideShortcutCard,
} from '@/features/search'
import { useDeferredTabMount } from '@/hooks/useDeferredTabMount'
import { localizeContent } from '@/lib/i18n'

const flourishDark = require('../../../../assets/textures/notch_search_dark.png')
const flourishLight = require('../../../../assets/textures/notch_search_light.png')
const flourishAspect = 2172 / 478
const flourishLightAspect = 2153 / 334

// Android's header search bar is a toolbar action that unfolds over the page,
// covering the flourish and the first results; there the field sits in the page
// and stands in for the title.
const inPageField = Platform.OS === 'android'

// With a query, live corpus search; empty, a lobby: Mass times, three fixed
// places, the doors into the corpus and what was last opened.
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
  const screenOptions = useMemo(() => {
    if (inPageField) return { headerShown: false }
    return {
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
    }
  }, [t, onSearchChange])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps once the catalog (and the Rosary's name) loads.
  const placeTiles = useMemo<ShortcutTileData[]>(
    () => [
      {
        key: 'mass',
        title: t('home.holyMass'),
        icon: Church,
        href: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
      },
      { key: 'bible', title: t('home.bible'), icon: BookOpen, href: '/bible' },
      {
        key: 'rosary',
        title: localizeContent(getEntry('practice/rosary')?.name ?? {}),
        icon: Sparkle,
        href: { pathname: '/pray/[practiceId]', params: { practiceId: 'rosary' } },
      },
    ],
    [catalogVersion, t],
  )

  // Memoized and hidden rather than unmounted while a query is typed: each
  // keystroke re-renders this screen, and remounting the tiles when the query
  // is cleared took ~200ms.
  const browse = useMemo(() => {
    // Each tile keeps a stable hue keyed on its identity, not its position.
    const withTones = (tiles: ShortcutTileData[]): ShortcutTileData[] =>
      tiles.map((tile) => ({ ...tile, tone: toneForKey(tile.key) }))
    return (
      <YStack gap="$xl" paddingTop="$sm" paddingBottom="$lg">
        {!inPageField && <PageHeader title={t('nav.searchPlaceholder')} />}
        <YStack gap="$md">
          <WideShortcutCard
            title={t('massTimes.cardTitle')}
            subtitle={t('massTimes.exploreTagline')}
            icon={Church}
            tone={toneForKey('mass-times')}
            href="/mass-times"
          />
          <ShortcutGrid items={withTones(placeTiles)} columns={3} />
        </YStack>
        <Acervo />
        <RecentRow />
      </YStack>
    )
  }, [t, placeTiles])

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
          {inPageField && <SearchField query={query} onQuery={setQuery} />}
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

function SearchField({ query, onQuery }: { query: string; onQuery: (query: string) => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <XStack
      marginTop="$md"
      marginBottom="$sm"
      paddingHorizontal="$md"
      alignItems="center"
      gap="$sm"
      borderRadius="$lg"
      backgroundColor="$backgroundSurface"
    >
      <Search size={18} color={theme.colorSecondary?.val} />
      <SearchInput
        flex={1}
        value={query}
        onChangeText={onQuery}
        placeholder={t('pray.searchPlaceholder')}
        placeholderTextColor="$colorSecondary"
        backgroundColor="transparent"
        borderWidth={0}
        paddingHorizontal={0}
        height={48}
        color="$color"
        fontFamily="$body"
        fontSize="$3"
        accessibilityLabel={t('nav.searchPlaceholder')}
      />
      {query.length > 0 && (
        <AnimatedPressable
          onPress={() => onQuery('')}
          hitSlop={14}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.clearSearch')}
        >
          <X size={16} color={theme.colorSecondary?.val} />
        </AnimatedPressable>
      )}
    </XStack>
  )
}
