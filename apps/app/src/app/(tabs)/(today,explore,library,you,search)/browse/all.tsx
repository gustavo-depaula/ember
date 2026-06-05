import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { getCollectionItems, getEntriesByKind } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { collectionHref, warmCollection } from '@/features/collections'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type CollectionRow = {
  id: string
  name: string
  practiceCount: number
}

// Two square jewel cards across the standard ScreenLayout column (max 640,
// $lg = 24 each side). Square reads as a quarry/illuminated block — collections
// are jewels, not books.
const columns = 2
const gutter = 14
function useCardSize(): number {
  const { width } = useWindowDimensions()
  const content = Math.min(width, 640) - 24 * 2
  return Math.floor((content - gutter * (columns - 1)) / columns)
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export default function AllCollectionsScreen() {
  const { t } = useTranslation()
  const size = useCardSize()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const collections = useMemo<CollectionRow[]>(() => {
    const out: CollectionRow[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      const name =
        localizeContent(((entry as CatalogEntry).name ?? {}) as Record<string, string>) ||
        bareId(id)
      out.push({
        id,
        name,
        practiceCount: getCollectionItems(id).filter((i) => i.entry?.kind === 'practice').length,
      })
    }
    out.sort((a, b) => a.name.localeCompare(b.name))
    return out
  }, [catalogVersion])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('pray.allCollections')} />

        {collections.length === 0 ? (
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg" paddingHorizontal="$lg">
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {t('browse.emptyState')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
            >
              {t('browse.registryOffline')}
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" gap={gutter}>
            {collections.map((c) => (
              <ArtCoverCard
                key={c.id}
                title={c.name}
                subtitle={t('catalog.practiceCount', {
                  count: c.practiceCount,
                  defaultValue: `${c.practiceCount} items`,
                })}
                image={artFor(c.id)}
                tone={toneForKey(c.id)}
                size={size}
                href={collectionHref(c.id)}
                onPress={() => warmCollection(c.id)}
              />
            ))}
          </XStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
