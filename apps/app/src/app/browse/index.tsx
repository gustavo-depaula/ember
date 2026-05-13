import { useRouter } from 'expo-router'
import { ChevronRight, Mic2 } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { getEntriesByKind, getEntry } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CollectionCard } from '@/features/collections/CollectionCard'
import { HeroCard } from '@/features/collections/HeroCard'
import { SeasonCard } from '@/features/collections/SeasonCard'
import { pickSpotlight } from '@/features/collections/seasonalSpotlight'
import {
  activeSeasonKey,
  type CollectionId,
  dailyIds,
  formationIds,
  genreIds,
  patrimonyIds,
  schoolIds,
  seasonOrder,
  themeIds,
} from '@/features/collections/sectionLayout'
import { useToday } from '@/hooks/useToday'
import i18n from '@/lib/i18n'
import type { LiturgicalCalendarForm } from '@/lib/liturgical'
import { getLiturgicalSeason } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

function SectionHeading({ text }: { text: string }) {
  return (
    <Text
      fontFamily="$heading"
      fontSize="$2"
      color="$accent"
      letterSpacing={2}
      textTransform="uppercase"
      paddingHorizontal="$md"
    >
      {text}
    </Text>
  )
}

function CardRow({ ids, cardWidth = 200 }: { ids: CollectionId[]; cardWidth?: number }) {
  const visible = ids.filter((id) => !!getEntry(id))
  if (visible.length === 0) return null
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
    >
      {visible.map((id) => (
        <CollectionCard key={id} collectionId={id} width={cardWidth} />
      ))}
    </ScrollView>
  )
}

function CreatorsEntry() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()
  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const count = useMemo(() => getEntriesByKind('creator').length, [catalogVersion])
  if (count === 0) return null
  return (
    <YStack paddingHorizontal="$md">
      <AnimatedPressable
        onPress={() => router.push('/creators')}
        accessibilityRole="link"
        accessibilityLabel={t('creators.entry.title')}
      >
        <XStack
          backgroundColor="$accentSubtle"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$accent"
          padding="$md"
          gap="$md"
          alignItems="center"
        >
          <YStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="$background"
            alignItems="center"
            justifyContent="center"
          >
            <Mic2 size={24} color={theme.accent.val} />
          </YStack>
          <YStack flex={1} gap={2}>
            <Text fontFamily="$display" fontSize="$3" color="$color">
              {t('creators.entry.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t('creators.entry.subtitle', { count })}
            </Text>
          </YStack>
          <ChevronRight size={20} color={theme.accent.val} />
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}

function localeMatches(entry: CatalogEntry, currentLang: string): boolean {
  const langs = (entry as { languages?: string[] }).languages
  if (!langs || langs.length === 0) return true
  return langs.includes(currentLang)
}

export default function PrayDiscoveryScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()
  const now = useToday()
  const liturgicalCalendar = usePreferencesStore(
    (s) => s.liturgicalCalendar,
  ) as LiturgicalCalendarForm

  const season = useMemo(
    () => getLiturgicalSeason(now, liturgicalCalendar),
    [now, liturgicalCalendar],
  )

  const spotlight = useMemo(() => pickSpotlight(season, now), [season, now])
  const currentSeasonKey = useMemo(() => activeSeasonKey(season, now.getMonth()), [season, now])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const visiblePatrimony = useMemo(() => {
    const lang = i18n.language || 'en-US'
    return patrimonyIds.filter((id) => {
      const entry = getEntry(id)
      if (!entry || entry.kind !== 'collection') return false
      return localeMatches(entry, lang)
    })
  }, [catalogVersion])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('catalog.title')} />

        <YStack paddingHorizontal="$md">
          <HeroCard collectionId={spotlight.collectionId} taglineKey={spotlight.taglineKey} />
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.daily')} />
          <YStack paddingHorizontal="$md">
            {dailyIds.map((id) => (
              <CollectionCard key={id} collectionId={id} width="100%" />
            ))}
          </YStack>
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.formation')} />
          <CardRow ids={formationIds} />
        </YStack>

        <CreatorsEntry />

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.themes')} />
          <CardRow ids={themeIds} />
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.genres')} />
          <CardRow ids={genreIds} />
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.schools')} />
          <CardRow ids={schoolIds} />
        </YStack>

        {visiblePatrimony.length > 0 && (
          <YStack gap="$sm">
            <SectionHeading text={t('pray.section.patrimony')} />
            <CardRow ids={visiblePatrimony} />
          </YStack>
        )}

        <YStack gap="$sm">
          <SectionHeading text={t('pray.section.liturgicalYear')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
          >
            {seasonOrder.map((key) => (
              <SeasonCard key={key} season={key} active={key === currentSeasonKey} />
            ))}
          </ScrollView>
        </YStack>

        <YStack paddingHorizontal="$md" paddingTop="$md">
          <AnimatedPressable
            onPress={() => router.push('/browse/all')}
            accessibilityRole="link"
            accessibilityLabel={t('pray.allCollections')}
          >
            <YStack
              backgroundColor="$backgroundSurface"
              borderRadius="$lg"
              borderWidth={1}
              borderColor="$borderColor"
              paddingHorizontal="$md"
              paddingVertical="$md"
              alignItems="center"
            >
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('pray.allCollections')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t('pray.allCollectionsHint')}
              </Text>
            </YStack>
          </AnimatedPressable>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
