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

const CARD_SIZE = 150
const GRID_PAGE_PAD = 24
const GRID_GAP = 16
// Max width matches the ScreenLayout container so the grid lays out the same
// on phones, foldables, and the centered content column on web/tablets.
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
    return Math.floor((effectiveWidth - 2 * GRID_PAGE_PAD - GRID_GAP) / 2)
  }, [screenWidth])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as the catalog warms.
  const allRows = useMemo<CreatorRow[]>(
    () => getEntriesByKind('creator').map(([id, entry]) => ({ id, entry })),
    [catalogVersion],
  )

  // Warm channel metadata + feed items on first visit so all avatars + Latest
  // populate without requiring the user to open each profile.
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

  return (
    <ScreenLayout padded={false}>
      <YStack paddingTop="$lg" gap="$xl" paddingBottom="$xl">
        {/* Header */}
        <YStack paddingHorizontal="$lg" gap="$xs">
          <Text fontFamily="$display" fontSize="$5" color="$color">
            {t('creators.title')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight={22}>
            {t('creators.tagline')}
          </Text>
        </YStack>

        {/* Language filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
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

        {/* Sections: when 'all' is selected we show horizontal carousels per
            language (good for at-a-glance browsing across languages); when a
            specific language is selected we flatten into a 2-column vertical
            grid (lets the user actually browse every creator in that
            language without horizontal scrubbing). */}
        {totalVisible === 0 ? (
          <YStack alignItems="center" padding="$xl">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('creators.empty')}
            </Text>
          </YStack>
        ) : filter === 'all' ? (
          sections.map((section) => (
            <YStack key={section.lang} gap="$md">
              <XStack paddingHorizontal="$lg" alignItems="baseline" justifyContent="space-between">
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
                contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
              >
                {section.rows.map((row) => (
                  <CreatorGridCard key={row.id} creatorId={row.id} size={CARD_SIZE} />
                ))}
              </ScrollView>
            </YStack>
          ))
        ) : (
          <YStack paddingHorizontal="$lg">
            <XStack flexWrap="wrap" gap={GRID_GAP} rowGap="$lg">
              {sections
                .flatMap((s) => s.rows)
                .map((row) => (
                  <CreatorGridCard key={row.id} creatorId={row.id} size={gridCardSize} />
                ))}
            </XStack>
          </YStack>
        )}

        {/* Suggest a creator */}
        <YStack paddingHorizontal="$lg" paddingTop="$md">
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
