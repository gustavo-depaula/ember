import { useRouter } from 'expo-router'
import { ChevronLeft, Search } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Input, Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import {
  getAllManifests,
  getManifestCategories,
  getManifestIconKey,
  searchManifests,
} from '@/content/practices'
import type { PracticeManifest } from '@/content/types'
import { getPracticeIcon } from '@/db/seed'
import { useAllPractices } from '@/features/plan-of-life'
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
    <Pressable onPress={onPress}>
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

  const iconKey = getManifestIconKey(manifest.id)

  const description = manifest.description ? localizeContent(manifest.description) : ''
  const snippet = description.length > 100 ? `${description.slice(0, 100)}...` : description

  return (
    <Pressable onPress={onPress}>
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={28}>{getPracticeIcon(iconKey)}</Text>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {localizeContent(manifest.name)}
          </Text>
          {snippet && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={2}>
              {snippet}
            </Text>
          )}
          <XStack gap="$sm" alignItems="center" marginTop={2}>
            {manifest.estimatedMinutes && (
              <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                {t('catalog.estimatedTime', { minutes: manifest.estimatedMinutes })}
              </Text>
            )}
            {inPlan && (
              <Text fontFamily="$body" fontSize={11} color="$accent">
                {t('catalog.alreadyInPlan')}
              </Text>
            )}
          </XStack>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </Pressable>
  )
}

export default function PracticeCatalogScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | undefined>()

  const categories = useMemo(() => getManifestCategories(), [])
  const { data: allPractices = [] } = useAllPractices()
  const enabledManifestIds = useMemo(
    () => new Set(allPractices.filter((p) => p.enabled).map((p) => p.manifest_id)),
    [allPractices],
  )

  const filteredManifests = useMemo(() => {
    let results: PracticeManifest[]
    if (searchQuery.trim()) {
      results = searchManifests(searchQuery)
    } else {
      results = getAllManifests()
    }
    if (activeCategory) {
      results = results.filter((m) => m.categories.includes(activeCategory))
    }
    return results
  }, [searchQuery, activeCategory])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            {t('catalog.title')}
          </Text>
        </XStack>

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

        <CategoryChips
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        <YStack gap="$sm">
          {filteredManifests.map((manifest) => (
            <PracticeCard
              key={manifest.id}
              manifest={manifest}
              inPlan={enabledManifestIds.has(manifest.id)}
              onPress={() => router.push(`/practices/${manifest.id}` as any)}
            />
          ))}

          {filteredManifests.length === 0 && (
            <Text
              fontFamily="$body"
              fontSize="$3"
              color="$colorSecondary"
              textAlign="center"
              paddingVertical="$xl"
            >
              {t('catalog.noResults')}
            </Text>
          )}
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
