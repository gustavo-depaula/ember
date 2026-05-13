import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { openExternalUrl, SUGGEST_CREATOR_URL } from '@/config/links'
import { getEntriesByKind } from '@/content/contentIndex'
import type { CatalogEntry, CreatorLanguage } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CreatorGridCard } from '@/features/creators/components/CreatorGridCard'
import { refreshCreator } from '@/features/creators/feeds/fetcher'

const LANG_FILTERS = ['all', 'en-US', 'pt-BR'] as const
type LangFilter = (typeof LANG_FILTERS)[number]
const FILTER_LABEL_KEY: Record<LangFilter, string> = {
  all: 'creators.filter.allLanguages',
  'en-US': 'creators.filter.english',
  'pt-BR': 'creators.filter.portuguese',
}

const SECTION_LANGS: CreatorLanguage[] = ['en-US', 'pt-BR']
const SECTION_LABEL_KEY: Record<CreatorLanguage, string> = {
  'en-US': 'creators.section.english',
  'pt-BR': 'creators.section.portuguese',
  la: 'creators.section.latin',
}

// Pixel values. ScreenLayout's `padded={true}` (default) applies `$lg` (24pt)
// horizontal padding to the page; carousels use `marginHorizontal={-PAGE_PAD}`
// to extend back to the screen edge so the last card "peeks" past the right
// edge, matching the Apple/Spotify horizontal-scroller affordance.
const PAGE_PAD = 24
const CARD_SIZE = 150
const GRID_GAP = 16
const GRID_MAX_WIDTH = 640

function FilterPill({
  active,
  label,
  onPress,
}: {
  active: boolean
  label: string
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <YStack
        backgroundColor={active ? '$accent' : '$backgroundSurface'}
        borderRadius={999}
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        paddingHorizontal="$md"
        paddingVertical="$sm"
      >
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color={active ? 'white' : '$color'}
          letterSpacing={1}
        >
          {label}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

function entryHasLanguage(entry: CatalogEntry, lang: CreatorLanguage): boolean {
  return entry.creatorLanguages?.includes(lang) ?? false
}

type CreatorRow = { id: string; entry: CatalogEntry }

function sortByName(rows: CreatorRow[]): CreatorRow[] {
  return [...rows].sort((a, b) =>
    (a.entry.name?.['en-US'] ?? a.id).localeCompare(b.entry.name?.['en-US'] ?? b.id),
  )
}

export default function CreatorsDirectory() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const [filter, setFilter] = useState<LangFilter>('all')
  const { width: screenWidth } = useWindowDimensions()
  const gridCardSize = useMemo(() => {
    const effectiveWidth = Math.min(screenWidth, GRID_MAX_WIDTH)
    return Math.floor((effectiveWidth - 2 * PAGE_PAD - GRID_GAP) / 2)
  }, [screenWidth])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as the catalog warms.
  const allRows = useMemo<CreatorRow[]>(
    () => getEntriesByKind('creator').map(([id, entry]) => ({ id, entry })),
    [catalogVersion],
  )

  useEffect(() => {
    for (const { id } of allRows) {
      void refreshCreator(id).catch(() => {})
    }
  }, [allRows])

  const sections = useMemo(() => {
    return SECTION_LANGS.map((lang) => ({
      lang,
      rows: sortByName(
        allRows.filter(
          ({ entry }) => entryHasLanguage(entry, lang) && (filter === 'all' || filter === lang),
        ),
      ),
    })).filter((s) => s.rows.length > 0)
  }, [allRows, filter])

  const totalVisible = sections.reduce((n, s) => n + s.rows.length, 0)

  // Style objects for the ScrollViews that need to bleed past the page's
  // horizontal padding: negative margin = the page padding, content
  // container then pads back in so the first item is properly inset.
  const bleedScroll = { marginHorizontal: -PAGE_PAD }
  const bleedContent = (gap: number) => ({ paddingHorizontal: PAGE_PAD, gap })

  return (
    <ScreenLayout>
      <YStack paddingVertical="$lg" gap="$xl">
        {/* Header */}
        <YStack gap="$xs">
          <Text fontFamily="$display" fontSize="$5" color="$color">
            {t('creators.title')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight={22}>
            {t('creators.tagline')}
          </Text>
        </YStack>

        {/* Language filter pills — also bleeds so chips align with carousels */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={bleedScroll}
          contentContainerStyle={bleedContent(8)}
        >
          {LANG_FILTERS.map((code) => (
            <FilterPill
              key={code}
              active={filter === code}
              label={t(FILTER_LABEL_KEY[code])}
              onPress={() => setFilter(code)}
            />
          ))}
        </ScrollView>

        {/* Sections */}
        {totalVisible === 0 ? (
          <YStack alignItems="center" padding="$xl">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('creators.empty')}
            </Text>
          </YStack>
        ) : filter === 'all' ? (
          sections.map((section) => (
            <YStack key={section.lang} gap="$md">
              <XStack alignItems="baseline" justifyContent="space-between">
                <Text fontFamily="$display" fontSize="$3" color="$color">
                  {t(SECTION_LABEL_KEY[section.lang])}
                </Text>
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {section.rows.length}
                </Text>
              </XStack>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={bleedScroll}
                contentContainerStyle={bleedContent(14)}
              >
                {section.rows.map((row) => (
                  <CreatorGridCard key={row.id} creatorId={row.id} size={CARD_SIZE} />
                ))}
              </ScrollView>
            </YStack>
          ))
        ) : (
          <XStack flexWrap="wrap" gap={GRID_GAP} rowGap="$lg">
            {sections
              .flatMap((s) => s.rows)
              .map((row) => (
                <CreatorGridCard key={row.id} creatorId={row.id} size={gridCardSize} />
              ))}
          </XStack>
        )}

        {/* Suggest a creator */}
        <YStack paddingTop="$md">
          <AnimatedPressable
            onPress={() => openExternalUrl(SUGGEST_CREATOR_URL)}
            accessibilityRole="link"
            accessibilityLabel={t('creators.suggest')}
          >
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              padding="$md"
              alignItems="center"
              gap={2}
            >
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('creators.suggest')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('creators.suggestHint')}
              </Text>
            </YStack>
          </AnimatedPressable>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
