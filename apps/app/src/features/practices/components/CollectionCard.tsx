import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import { getCollectionItems } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

const cardWidth = 150
const cardHeight = 180

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function CollectionCard({
  collectionId,
  entry,
}: {
  collectionId: string
  entry: CatalogEntry
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()

  const name = entry.name ? localizeContent(entry.name) : bareId(collectionId)
  const iconKey = (entry.icon as string | undefined) ?? 'book'

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps when deferred collection bodies warm in.
  const subtitle = useMemo(() => {
    const items = getCollectionItems(collectionId)
    let practiceCount = 0
    let bookCount = 0
    let prayerCount = 0
    for (const it of items) {
      if (it.entry?.kind === 'practice') practiceCount++
      else if (it.entry?.kind === 'book') bookCount++
      else if (it.entry?.kind === 'prayer') prayerCount++
    }
    const parts: string[] = []
    if (practiceCount > 0) parts.push(t('catalog.practiceCount', { count: practiceCount }))
    if (bookCount > 0) parts.push(t('catalog.bookCount', { count: bookCount }))
    else if (prayerCount > 0) parts.push(t('catalog.prayerCount', { count: prayerCount }))
    return parts.join(' · ')
  }, [collectionId, catalogVersion, t])

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/browse/[collectionId]',
          params: { collectionId: bareId(collectionId) },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      <YStack
        width={cardWidth}
        height={cardHeight}
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        padding="$md"
        gap="$sm"
        justifyContent="space-between"
      >
        <PracticeIcon name={iconKey} size={32} />
        <YStack gap={4}>
          <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={3}>
            {name}
          </Text>
          {subtitle.length > 0 && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </YStack>
      </YStack>
    </Pressable>
  )
}
