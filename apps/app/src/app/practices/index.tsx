import { useRouter } from 'expo-router'
import { Plus, Search, X } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native'
import { Input, Text, useTheme, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout, SectionDivider } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import {
  getCollectionItems,
  getCollectionsForItem,
  getEntriesByKind,
  getEntry,
  isHiddenCollection,
} from '@/content/contentIndex'
import { getAllManifests, getManifestCategories, getManifestIconKey } from '@/content/resolver'
import type { PracticeManifest } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { usePinnedItems } from '@/features/pinning/hooks'
import { useAllSlots, useCreatePractice } from '@/features/plan-of-life'
import type { PracticeFormData } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import {
  AllPrayersList,
  CollectionCard,
  EssentialPrayersRow,
  PrayerModal,
  PrayNowCard,
  SearchAutocomplete,
} from '@/features/practices/components'
import { useCurrentHour } from '@/hooks/useCurrentHour'
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

function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: string[]
  active: string | undefined
  onSelect: (cat: string | undefined) => void
}) {
  const { t } = useTranslation()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      <CategoryChip
        label={t('catalog.all')}
        isActive={!active}
        onPress={() => onSelect(undefined)}
      />
      {categories.map((cat) => (
        <CategoryChip
          key={cat}
          label={t(`category.${cat}`, { defaultValue: cat })}
          isActive={active === cat}
          onPress={() => onSelect(cat)}
        />
      ))}
    </ScrollView>
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function PracticeCatalogScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const hour = useCurrentHour()
  const catalogVersion = useCatalogVersion()
  const { data: pinned = [] } = usePinnedItems()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>()
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | undefined>()
  const createPractice = useCreatePractice()

  const isSearching = searchQuery.trim().length > 0

  function handleSave(data: PracticeFormData) {
    createPractice.mutate({
      id: slugify(data.name),
      customName: data.name,
      customIcon: data.icon,
      customDesc: data.description,
      slot: {
        tier: data.tier,
        time: undefined,
        schedule: JSON.stringify(data.schedule),
      },
    })
    setShowEditor(false)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal for derived collection data.
  const collections = useMemo(() => {
    const out: { id: string; entry: ReturnType<typeof getEntry> }[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      if (isHiddenCollection(id)) continue
      out.push({ id, entry })
    }
    return out.sort((a, b) => {
      const aItems = getCollectionItems(a.id).length
      const bItems = getCollectionItems(b.id).length
      return bItems - aItems
    })
  }, [catalogVersion])

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
    if (pinnedOnly) {
      results = results.filter((m) => {
        const corpusId = m.id.includes('/') ? m.id : `practice/${m.id}`
        return pinnedPracticeIds.has(corpusId)
      })
    }
    return results
  }, [activeCategory, pinnedOnly, pinnedPracticeIds, catalogVersion])

  const handleCardPress = useCallback(
    (manifestId: string) => {
      router.push({
        pathname: '/practices/[manifestId]',
        params: { manifestId },
      })
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

  const SearchBar = (
    <XStack
      backgroundColor="$backgroundSurface"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      paddingHorizontal="$md"
      alignItems="center"
      gap="$sm"
    >
      <Search size={16} color={theme.colorSecondary?.val} />
      <Input
        flex={1}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('pray.searchPlaceholder')}
        fontFamily="$body"
        fontSize="$3"
        borderWidth={0}
        backgroundColor="transparent"
        height={44}
        paddingHorizontal={0}
      />
      {isSearching && (
        <Pressable
          onPress={() => setSearchQuery('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('catalog.clearFilters')}
        >
          <X size={16} color={theme.colorSecondary?.val} />
        </Pressable>
      )}
    </XStack>
  )

  const Header = (
    <YStack gap="$lg" paddingVertical="$lg">
      <PageHeader title={t('catalog.title')} />

      {!isSearching && <PrayNowCard hour={hour} />}

      {SearchBar}

      {isSearching && (
        <SearchAutocomplete query={searchQuery} onSelectPrayer={setSelectedPrayerId} />
      )}

      {!isSearching && (
        <>
          {collections.length > 0 && (
            <YStack gap="$sm">
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t('pray.collections')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 12 }}
              >
                {collections.map(({ id, entry }) =>
                  entry ? <CollectionCard key={id} collectionId={id} entry={entry} /> : undefined,
                )}
              </ScrollView>
            </YStack>
          )}

          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {t('pray.essentialPrayers')}
            </Text>
            <EssentialPrayersRow onSelect={setSelectedPrayerId} />
          </YStack>

          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {t('pray.allPrayers')}
            </Text>
            <AllPrayersList onSelect={setSelectedPrayerId} />
          </YStack>

          <SectionDivider />

          <YStack gap="$sm">
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {t('pray.allPractices')}
            </Text>

            <XStack gap="$sm" alignItems="center">
              <CategoryChip
                label={t('pinning.pinnedFilter')}
                isActive={pinnedOnly}
                onPress={() => setPinnedOnly((p) => !p)}
              />
              <YStack flex={1}>
                <CategoryChips
                  categories={categories}
                  active={activeCategory}
                  onSelect={setActiveCategory}
                />
              </YStack>
            </XStack>

            <Pressable
              onPress={() => setShowEditor(true)}
              accessibilityRole="button"
              accessibilityLabel={t('plan.addCustom')}
            >
              <XStack
                borderRadius="$lg"
                padding="$md"
                gap="$md"
                alignItems="center"
                borderWidth={1}
                borderColor="$accent"
                borderStyle="dashed"
              >
                <YStack width={36} height={36} alignItems="center" justifyContent="center">
                  <Plus size={24} color={theme.accent?.val} />
                </YStack>
                <YStack flex={1} gap={2}>
                  <Text fontFamily="$heading" fontSize="$3" color="$accent">
                    {t('plan.addCustom')}
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                    {t('catalog.customDescription')}
                  </Text>
                </YStack>
              </XStack>
            </Pressable>
          </YStack>
        </>
      )}
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
        {(activeCategory || pinnedOnly) && (
          <Pressable
            onPress={() => {
              setActiveCategory(undefined)
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

  // FlatList virtualizes the long practices list; ScreenLayout(scroll=false)
  // keeps it as the page's scroll container so virtualization works.
  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout scroll={false}>
        <FlatList
          data={isSearching ? [] : filteredManifests}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={Header}
          ListEmptyComponent={Empty}
          initialNumToRender={10}
          windowSize={5}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
        />

        <Modal
          visible={showEditor}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditor(false)}
        >
          <YStack flex={1} justifyContent="flex-end">
            <Pressable
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
              onPress={() => setShowEditor(false)}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.closeModal')}
            />
            <PracticeEditSheet onSave={handleSave} onClose={() => setShowEditor(false)} />
          </YStack>
        </Modal>
      </ScreenLayout>

      <PrayerModal prayerId={selectedPrayerId} onClose={() => setSelectedPrayerId(undefined)} />
    </View>
  )
}
