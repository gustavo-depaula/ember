import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { openExternalUrl, SUGGEST_CREATOR_URL } from '@/config/links'
import { getEntriesByKind } from '@/content/contentIndex'
import type { CatalogEntry, CreatorLanguage } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CreatorCard } from '@/features/creators/components/CreatorCard'

const LANG_FILTERS = ['all', 'en-US', 'pt-BR'] as const
type LangFilter = (typeof LANG_FILTERS)[number]
const FILTER_LABEL_KEY: Record<LangFilter, string> = {
  all: 'creators.filter.allLanguages',
  'en-US': 'creators.filter.english',
  'pt-BR': 'creators.filter.portuguese',
}

function FilterChip({
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
        backgroundColor={active ? '$accentSubtle' : '$backgroundSurface'}
        borderRadius="$md"
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        paddingHorizontal="$md"
        paddingVertical="$sm"
      >
        <Text fontFamily="$heading" fontSize="$1" color={active ? '$accent' : '$color'}>
          {label}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

function entryHasLanguage(entry: CatalogEntry, lang: CreatorLanguage): boolean {
  return entry.creatorLanguages?.includes(lang) ?? false
}

export default function CreatorsDirectory() {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const [filter, setFilter] = useState<LangFilter>('all')

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as the catalog warms.
  const entries = useMemo(
    () =>
      getEntriesByKind('creator')
        .map(([id, entry]) => ({ id, entry }))
        .sort((a, b) =>
          (a.entry.name?.['en-US'] ?? a.id).localeCompare(b.entry.name?.['en-US'] ?? b.id),
        ),
    [catalogVersion],
  )

  const visible = useMemo(
    () =>
      filter === 'all' ? entries : entries.filter(({ entry }) => entryHasLanguage(entry, filter)),
    [entries, filter],
  )

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('creators.title')} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {LANG_FILTERS.map((code) => (
            <FilterChip
              key={code}
              active={filter === code}
              label={t(FILTER_LABEL_KEY[code])}
              onPress={() => setFilter(code)}
            />
          ))}
        </ScrollView>

        {visible.length === 0 ? (
          <YStack alignItems="center" padding="$lg">
            <Text fontFamily="$body" color="$colorSecondary">
              {t('creators.empty')}
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" gap="$md" justifyContent="center" paddingHorizontal="$md">
            {visible.map(({ id }) => (
              <CreatorCard key={id} creatorId={id} width={160} />
            ))}
          </XStack>
        )}

        <YStack paddingHorizontal="$md" paddingTop="$md">
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
