import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { openExternalUrl, SUGGEST_CREATOR_URL } from '@/config/links'
import { getEntriesByKind } from '@/content/contentIndex'
import type { CatalogEntry, CreatorLanguage } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CreatorListItem } from '@/features/creators/components/CreatorListItem'

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
          color={active ? '$backgroundSurface' : '$color'}
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as the catalog warms.
  const allRows = useMemo<CreatorRow[]>(
    () => getEntriesByKind('creator').map(([id, entry]) => ({ id, entry })),
    [catalogVersion],
  )

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
      <YStack paddingVertical="$lg" gap="$lg">
        <YStack paddingHorizontal="$lg" gap="$xs">
          <Text fontFamily="$display" fontSize="$5" color="$color">
            {t('creators.title')}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight={22}>
            {t('creators.tagline')}
          </Text>
        </YStack>

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

        {totalVisible === 0 ? (
          <YStack alignItems="center" padding="$xl">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('creators.empty')}
            </Text>
          </YStack>
        ) : (
          <YStack
            backgroundColor="$background"
            marginHorizontal="$lg"
            borderRadius="$lg"
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
          >
            {sections.map((section, sIdx) => (
              <YStack key={section.lang}>
                {(sections.length > 1 || filter === 'all') && (
                  <XStack
                    paddingHorizontal="$lg"
                    paddingTop={sIdx === 0 ? '$md' : '$lg'}
                    paddingBottom="$xs"
                    backgroundColor="$backgroundSurface"
                    borderBottomWidth={1}
                    borderBottomColor="$borderColor"
                  >
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color="$accent"
                      letterSpacing={2}
                      textTransform="uppercase"
                    >
                      {t(SECTION_LABEL_KEY[section.lang])}
                    </Text>
                  </XStack>
                )}
                {section.rows.map((row, rIdx) => (
                  <YStack
                    key={row.id}
                    borderBottomWidth={rIdx < section.rows.length - 1 ? 1 : 0}
                    borderBottomColor="$borderColor"
                  >
                    <CreatorListItem creatorId={row.id} />
                  </YStack>
                ))}
              </YStack>
            ))}
          </YStack>
        )}

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
