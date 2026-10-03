import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout, Typography } from '@/components'
import { getEntriesByKind } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import {
  collectionHref,
  collectionShelves,
  unshelvedKey,
  warmCollection,
} from '@/features/collections'
import { coverFor } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type CollectionRow = {
  id: string
  name: string
  entry: CatalogEntry
}

// What a collection holds, in the order a reader cares about. A shelf of books
// is not "0 practices", so each kind is named and the absent ones are left out.
const countKeys = [
  ['book', 'catalog.bookCount'],
  ['practice', 'catalog.practiceCount'],
  ['chapter', 'catalog.readingCount'],
  ['collection', 'catalog.collectionCount'],
] as const

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
  const shelves = useMemo<{ key: string; collections: CollectionRow[] }[]>(() => {
    const rows = new Map<string, CollectionRow>()
    for (const [id, entry] of getEntriesByKind('collection')) {
      const name =
        localizeContent(((entry as CatalogEntry).name ?? {}) as Record<string, string>) ||
        bareId(id)
      rows.set(id, { id, name, entry })
    }
    const out = collectionShelves.map(({ key, ids }) => ({
      key,
      collections: ids.flatMap((id) => {
        const row = rows.get(id)
        rows.delete(id)
        return row ? [row] : []
      }),
    }))
    out.push({
      key: unshelvedKey,
      collections: [...rows.values()].sort((a, b) => a.name.localeCompare(b.name)),
    })
    return out.filter((shelf) => shelf.collections.length > 0)
  }, [catalogVersion])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('pray.allCollections')} />

        {shelves.length === 0 ? (
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
          shelves.map((shelf) => (
            <YStack key={shelf.key} gap="$md">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t(`browse.shelf.${shelf.key}`)}
              </Typography>
              <XStack flexWrap="wrap" gap={gutter}>
                {shelf.collections.map((c) => (
                  <ArtCoverCard
                    key={c.id}
                    title={c.name}
                    subtitle={countKeys
                      .flatMap(([kind, key]) => {
                        const count = c.entry.itemCounts?.[kind]
                        return count ? [t(key, { count })] : []
                      })
                      .join(' · ')}
                    image={artFor(c.id)}
                    cover={coverFor(c.entry)}
                    tone={toneForKey(c.id)}
                    size={size}
                    href={collectionHref(c.id)}
                    onPress={() => warmCollection(c.id)}
                  />
                ))}
              </XStack>
            </YStack>
          ))
        )}
      </YStack>
    </ScreenLayout>
  )
}
