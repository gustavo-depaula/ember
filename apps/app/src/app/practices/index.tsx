import { useRouter } from 'expo-router'
import { Plus, Search } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView } from 'react-native'
import { Input, Text, useTheme, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import {
  getCollectionItems,
  getCollectionsForItem,
  getEntriesByKind,
  getEntry,
} from '@/content/contentIndex'
import {
  getAllManifests,
  getManifestCategories,
  getManifestIconKey,
  searchManifests,
} from '@/content/registry'
import type { PracticeManifest } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useAllSlots, useCreatePractice } from '@/features/plan-of-life'
import type { PracticeFormData } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal — re-running when it bumps is the point.
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
              manifest.estimatedMinutes > 0 && (
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

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>()
  const [activeCollectionId, setActiveCollectionId] = useState<string | undefined>()
  const [showEditor, setShowEditor] = useState(false)
  const createPractice = useCreatePractice()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const collectionFilters = useMemo(() => {
    const out: { id: string; label: string }[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      if (id === 'collection/starter') continue
      const label = entry.name ? localizeContent(entry.name as Record<string, string>) : id
      out.push({ id, label })
    }
    return out.sort((a, b) => a.label.localeCompare(b.label))
  }, [catalogVersion])

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

  const categories = useMemo(() => getManifestCategories(), [])
  const allSlots = useAllSlots()
  const enabledManifestIds = useMemo(
    () => new Set(allSlots.filter((s) => s.enabled).map((s) => s.practice_id)),
    [allSlots],
  )

  const filteredManifests = useMemo(() => {
    let results: PracticeManifest[]
    if (searchQuery.trim()) {
      results = searchManifests(searchQuery)
    } else {
      results = getAllManifests()
    }
    if (activeCollectionId) {
      const inCollection = new Set(
        getCollectionItems(activeCollectionId)
          .filter((it) => it.entry?.kind === 'practice')
          .map((it) => it.ref),
      )
      results = results.filter((m) => inCollection.has(m.id))
    }
    if (activeCategory) {
      results = results.filter((m) => m.categories.includes(activeCategory))
    }
    return results
  }, [searchQuery, activeCategory, activeCollectionId])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('catalog.title')} />

        <XStack
          backgroundColor="$backgroundSurface"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          paddingHorizontal="$md"
          alignItems="center"
          gap="$sm"
        >
          <Search size={16} color={theme.colorSecondary.val} />
          <Input
            flex={1}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('catalog.search')}
            fontFamily="$body"
            fontSize="$3"
            borderWidth={0}
            backgroundColor="transparent"
            height={44}
            paddingHorizontal={0}
          />
        </XStack>

        {collectionFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <CategoryChip
              label={t('catalog.all')}
              isActive={!activeCollectionId}
              onPress={() => setActiveCollectionId(undefined)}
            />
            {collectionFilters.map((c) => (
              <CategoryChip
                key={c.id}
                label={c.label}
                isActive={activeCollectionId === c.id}
                onPress={() => setActiveCollectionId((prev) => (prev === c.id ? undefined : c.id))}
              />
            ))}
          </ScrollView>
        )}

        <CategoryChips
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        <YStack gap="$sm">
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
                <Plus size={24} color={theme.accent.val} />
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

          {filteredManifests.map((manifest) => (
            <PracticeCard
              key={manifest.id}
              manifest={manifest}
              inPlan={enabledManifestIds.has(manifest.id)}
              onPress={() =>
                router.push({
                  pathname: '/practices/[manifestId]',
                  params: { manifestId: manifest.id },
                })
              }
            />
          ))}

          {filteredManifests.length === 0 && (
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
              {(searchQuery.trim() || activeCategory || activeCollectionId) && (
                <Pressable
                  onPress={() => {
                    setSearchQuery('')
                    setActiveCategory(undefined)
                    setActiveCollectionId(undefined)
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
          )}
        </YStack>
      </YStack>

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
  )
}
