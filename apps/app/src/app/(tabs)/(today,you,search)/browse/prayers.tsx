import { Image, type ImageSource } from 'expo-image'
import { Stack, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import { PageHeader, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { bareId, getEntry, isMetaId } from '@/content/contentIndex'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, GeneratedCover, type TileCover } from '@/features/covers'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { practiceHref } from '@/features/practices/practiceHref'
import { localizeContent } from '@/lib/i18n'

type Prayer = {
  id: string
  title: string
  minutes?: number
  tags: Set<string>
  image?: ImageSource
  cover?: TileCover
}

// The row's tile is the one the practice wears on Today and in collections, in miniature.
const tileSize = 72
type Facet = { key: string; tags: string[] }

// The two questions a prayer book's index answers: what kind of prayer, and
// to whom. Each option gathers the tags the corpus uses for it.
const forms: Facet[] = [
  { key: 'novena', tags: ['novena'] },
  { key: 'office', tags: ['office', 'breviary', 'liturgy-of-the-hours'] },
  { key: 'litany', tags: ['litany'] },
  { key: 'hymn', tags: ['hymn'] },
  { key: 'rosary', tags: ['rosary', 'chaplet'] },
]
const devotions: Facet[] = [
  { key: 'marian', tags: ['marian'] },
  { key: 'eucharistic', tags: ['eucharistic', 'communion', 'adoration', 'corpus-christi'] },
  { key: 'sacredHeart', tags: ['sacred-heart'] },
  { key: 'holySpirit', tags: ['holy-spirit', 'pentecost'] },
  { key: 'passion', tags: ['passion'] },
  { key: 'dead', tags: ['purgatory', 'dead'] },
  { key: 'saints', tags: ['saints'] },
]

function has(prayer: Prayer, facet: Facet | undefined): boolean {
  return !facet || facet.tags.some((tag) => prayer.tags.has(tag))
}

// Every prayer in the corpus in one list, narrowed by form and by devotion.
export default function AllPrayersScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const [formKey, setFormKey] = useState<string>()
  const [devotionKey, setDevotionKey] = useState<string>()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as manifests warm; titles localize per language.
  const prayers = useMemo<Prayer[]>(
    () =>
      getAllManifests()
        .filter((m) => !isAlternateForm(m) && !isMetaId(m.id))
        .map((m) => {
          const entry = getEntry(m.id)
          return {
            id: bareId(m.id),
            title: localizeContent(m.name),
            minutes: m.estimatedMinutes,
            tags: new Set([...(m.tags ?? []), ...(m.categories ?? [])]),
            image: artFor(m.id),
            cover: entry && coverFor(entry),
          }
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
    [catalogVersion, i18n.language],
  )

  const form = forms.find((f) => f.key === formKey)
  const devotion = devotions.find((d) => d.key === devotionKey)
  const shown = useMemo(
    () => prayers.filter((p) => has(p, form) && has(p, devotion)),
    [prayers, form, devotion],
  )

  const renderItem = useCallback(
    ({ item }: { item: Prayer }) => (
      <Pressable
        onPress={() => router.push(practiceHref(item.id))}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.viewPractice', { name: item.title })}
      >
        <XStack paddingVertical="$sm" alignItems="center" gap="$md">
          <PrayerTile prayer={item} />
          <YStack flex={1}>
            <Typography fontSize="$4" numberOfLines={2}>
              {item.title}
            </Typography>
            {item.minutes !== undefined && (
              <Typography variant="annotation">
                {t('catalog.estimatedTime', { minutes: item.minutes })}
              </Typography>
            )}
          </YStack>
        </XStack>
      </Pressable>
    ),
    [router, t],
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('search.prayers') }} />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        data={shown}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <YStack paddingTop="$lg" paddingBottom="$md" gap="$sm">
            <PageHeader title={t('search.prayers')} />
            <FacetRow
              allLabel={t('search.allForms')}
              facets={forms}
              labelFor={(key) => t(`search.form.${key}`)}
              selected={formKey}
              onSelect={setFormKey}
            />
            <FacetRow
              allLabel={t('search.allDevotions')}
              facets={devotions}
              labelFor={(key) => t(`search.devotion.${key}`)}
              selected={devotionKey}
              onSelect={setDevotionKey}
            />
            <Typography variant="annotation" paddingTop="$sm">
              {t('catalog.prayerCount', { count: shown.length })}
            </Typography>
          </YStack>
        }
        ListEmptyComponent={
          <Typography tone="muted" fontStyle="italic" paddingVertical="$lg">
            {t('search.noPrayers')}
          </Typography>
        }
        initialNumToRender={14}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyExtractor = (p: Prayer) => p.id

function PrayerTile({ prayer }: { prayer: Prayer }) {
  if (prayer.image)
    return (
      <Image
        source={prayer.image}
        style={{ width: tileSize, height: tileSize, borderRadius: 8 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    )
  if (!prayer.cover) return <YStack width={tileSize} height={tileSize} />
  return (
    <GeneratedCover
      cover={prayer.cover}
      title={prayer.title}
      tone={toneForKey(`practice/${prayer.id}`)}
      width={tileSize}
    />
  )
}

/** One line of typographic options; the chosen one takes the gold and an underline. */
function FacetRow({
  allLabel,
  facets,
  labelFor,
  selected,
  onSelect,
}: {
  allLabel: string
  facets: Facet[]
  labelFor: (key: string) => string
  selected: string | undefined
  onSelect: (key: string | undefined) => void
}) {
  const options = [
    { key: undefined, label: allLabel },
    ...facets.map((f) => ({ key: f.key, label: labelFor(f.key) })),
  ]
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -24 }}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 20 }}
    >
      {options.map(({ key, label }) => {
        const on = key === selected
        return (
          <Pressable
            key={key ?? 'all'}
            onPress={() => onSelect(key)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: on }}
            aria-checked={on}
          >
            <YStack minHeight={44} justifyContent="center">
              <YStack
                paddingBottom={3}
                borderBottomWidth={1.5}
                borderBottomColor={on ? '$accent' : 'transparent'}
              >
                <Typography fontSize="$3" color={on ? '$accent' : '$colorSecondary'}>
                  {label}
                </Typography>
              </YStack>
            </YStack>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
