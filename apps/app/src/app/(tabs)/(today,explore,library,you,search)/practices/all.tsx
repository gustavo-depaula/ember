import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getCollectionItems, getCollectionsForItem, getEntry } from '@/content/contentIndex'
import { getAllManifests, getManifestCategories, getManifestIconKey } from '@/content/resolver'
import type { PracticeManifest } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { usePinnedItems } from '@/features/pinning/hooks'
import { useAllSlots } from '@/features/plan-of-life'
import { SearchAutocomplete } from '@/features/practices/components'
import { isMoment, type Moment, momentForManifest } from '@/features/practices/moments'
import { localizeContent } from '@/lib/i18n'

function CategoryChip({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <YStack
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderRadius="$md"
        backgroundColor={isActive ? '$accent' : '$backgroundSurface'}
        borderWidth={1}
        borderColor={isActive ? '$accent' : '$borderColor'}
      >
        <Text fontFamily="$body" fontSize="$2" color={isActive ? 'white' : '$color'}>
          {label}
        </Text>
      </YStack>
    </Pressable>
  )
}

function MomentChip({ onClear, label }: { onClear: () => void; label: string }) {
  return (
    <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={label}>
      <XStack
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderRadius="$md"
        backgroundColor="$accent"
        borderWidth={1}
        borderColor="$accent"
        gap="$xs"
        alignItems="center"
      >
        <Text fontFamily="$body" fontSize="$2" color="white">
          {label}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="white">
          ✕
        </Text>
      </XStack>
    </Pressable>
  )
}

function PracticeCard({
  manifest,
  inPlan,
  onPress,
}: {
  manifest: PracticeManifest
  inPlan: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()

  const iconKey = getManifestIconKey(manifest.id)
  const name = localizeContent(manifest.name)
  const description = manifest.description ? localizeContent(manifest.description) : ''
  const snippet = description.length > 100 ? `${description.slice(0, 100)}...` : description

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const collectionLabels = useMemo(() => {
    const corpusId = manifest.id.includes('/') ? manifest.id : `practice/${manifest.id}`
    return getCollectionsForItem(corpusId)
      .map((cid) => {
        const entry = getEntry(cid)
        if (!entry?.name) return undefined
        return localizeContent(entry.name as Record<string, string>)
      })
      .filter((s): s is string => !!s)
      .slice(0, 2)
  }, [manifest.id, catalogVersion])

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.viewPractice', { name })}
      testID={`practice-card-${manifest.id}`}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <PracticeIcon name={iconKey} size={28} />
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {name}
          </Text>
          {snippet && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={2}>
              {snippet}
            </Text>
          )}
          <XStack gap="$sm" alignItems="center" marginTop={2} flexWrap="wrap">
            {manifest.program ? (
              <Text fontFamily="$body" fontSize="$1" color="$accent">
                {t('program.durationDays', { count: manifest.program.totalDays })}
              </Text>
            ) : (
              (manifest.estimatedMinutes ?? 0) > 0 && (
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes })}
                </Text>
              )
            )}
            {inPlan && (
              <Text fontFamily="$body" fontSize="$1" color="$accent">
                {t('catalog.alreadyInPlan')}
              </Text>
            )}
            {collectionLabels.map((label) => (
              <Text key={label} fontFamily="$body" fontSize="$1" color="$colorSecondary">
                · {label}
              </Text>
            ))}
          </XStack>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </Pressable>
  )
}

export default function AllPracticesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()
  const { data: pinned = [] } = usePinnedItems()
  const params = useLocalSearchParams<{ category?: string; moment?: string; pinned?: string }>()

  const initialCategory = typeof params.category === 'string' ? params.category : undefined
  const initialMoment =
    typeof params.moment === 'string' && isMoment(params.moment) ? params.moment : undefined
  const initialPinned = params.pinned === 'true'

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory)
  const [activeMoment, setActiveMoment] = useState<Moment | undefined>(initialMoment)
  const [pinnedOnly, setPinnedOnly] = useState(initialPinned)

  const isSearching = query.trim().length > 0

  const categories = useMemo(() => getManifestCategories(), [])
  const allSlots = useAllSlots()
  const enabledManifestIds = useMemo(
    () => new Set(allSlots.filter((s) => s.enabled).map((s) => s.practice_id)),
    [allSlots],
  )

  const pinnedPracticeIds = useMemo(() => {
    const direct = new Set(pinned.filter((p) => p.id.startsWith('practice/')).map((p) => p.id))
    for (const p of pinned) {
      if (!p.id.startsWith('collection/')) continue
      for (const it of getCollectionItems(p.id)) {
        if (it.entry?.kind === 'practice') direct.add(it.ref)
      }
    }
    return direct
  }, [pinned])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion tracks deferred manifest warm-up.
  const filteredManifests = useMemo(() => {
    let results: PracticeManifest[] = getAllManifests()
    if (activeCategory) {
      results = results.filter((m) => m.categories?.includes(activeCategory))
    }
    if (activeMoment) {
      results = results.filter((m) => momentForManifest(m) === activeMoment)
    }
    if (pinnedOnly) {
      results = results.filter((m) => {
        const corpusId = m.id.includes('/') ? m.id : `practice/${m.id}`
        return pinnedPracticeIds.has(corpusId)
      })
    }
    return results
  }, [activeCategory, activeMoment, pinnedOnly, pinnedPracticeIds, catalogVersion])

  const handleCardPress = useCallback(
    (manifestId: string) => {
      router.push({ pathname: '/practices/[manifestId]', params: { manifestId } })
    },
    [router],
  )

  const renderItem = useCallback(
    ({ item }: { item: PracticeManifest }) => (
      <View style={{ marginBottom: 8 }}>
        <PracticeCard
          manifest={item}
          inPlan={enabledManifestIds.has(item.id)}
          onPress={() => handleCardPress(item.id)}
        />
      </View>
    ),
    [enabledManifestIds, handleCardPress],
  )

  const keyExtractor = useCallback((m: PracticeManifest) => m.id, [])

  const Header = (
    <YStack gap="$md" paddingVertical="$lg">
      <PageHeader title={t('catalog.allPractices')} />

      <XStack gap="$sm" alignItems="center" flexWrap="wrap">
        <CategoryChip
          label={t('pinning.pinnedFilter')}
          isActive={pinnedOnly}
          onPress={() => setPinnedOnly((p) => !p)}
        />
        {activeMoment && (
          <MomentChip
            label={t(`catalog.moment.${activeMoment}`)}
            onClear={() => setActiveMoment(undefined)}
          />
        )}
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <CategoryChip
          label={t('catalog.all')}
          isActive={!activeCategory}
          onPress={() => setActiveCategory(undefined)}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            label={t(`category.${cat}`, { defaultValue: cat })}
            isActive={activeCategory === cat}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>
    </YStack>
  )

  const Empty =
    !isSearching && filteredManifests.length === 0 ? (
      <YStack alignItems="center" gap="$sm" paddingVertical="$xl" paddingHorizontal="$lg">
        <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
          {t('catalog.noResults')}
        </Text>
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$colorSecondary"
          textAlign="center"
          fontStyle="italic"
        >
          {t('catalog.noResultsDescription')}
        </Text>
        {(activeCategory || activeMoment || pinnedOnly) && (
          <Pressable
            onPress={() => {
              setActiveCategory(undefined)
              setActiveMoment(undefined)
              setPinnedOnly(false)
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('catalog.clearFilters')}
          >
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$accent"
              paddingVertical="$sm"
              paddingHorizontal="$md"
            >
              {t('catalog.clearFilters')}
            </Text>
          </Pressable>
        )}
      </YStack>
    ) : null

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          scrollEdgeEffects: { top: 'hidden' },
          headerSearchBarOptions: {
            placeholder: t('pray.searchPlaceholder'),
            onChangeText: (e: { nativeEvent: { text: string } }) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <View style={{ flex: 1 }}>
        <ScreenLayout scroll={false}>
          {isSearching ? (
            <YStack paddingVertical="$lg">
              <SearchAutocomplete query={query} />
            </YStack>
          ) : (
            <FlatList
              data={filteredManifests}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListHeaderComponent={Header}
              ListEmptyComponent={Empty}
              initialNumToRender={10}
              windowSize={5}
              removeClippedSubviews
              keyboardShouldPersistTaps="handled"
            />
          )}
        </ScreenLayout>
      </View>
    </>
  )
}
