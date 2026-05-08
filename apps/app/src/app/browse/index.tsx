import { useRouter } from 'expo-router'
import { Book } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { getCollectionItems, getEntriesByKind, isHiddenCollection } from '@/content/contentIndex'
import type { CatalogEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

type CollectionRow = {
  id: string
  bareId: string
  name: Record<string, string>
  practiceCount: number
}

function CollectionRowView({ entry, onPress }: { entry: CollectionRow; onPress: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const subtitle = `${entry.practiceCount} ${t('library.practices').toLowerCase()}`

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={localizeContent(entry.name)}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        gap="$md"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$sm"
      >
        <YStack
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$accentSubtle"
          borderRadius="$md"
        >
          <Book size={20} color={theme.accent?.val} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {localizeContent(entry.name)}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {subtitle}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export default function CollectionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const collections = useMemo<CollectionRow[]>(() => {
    const out: CollectionRow[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      if (isHiddenCollection(id)) continue
      out.push({
        id,
        bareId: bareId(id),
        name: ((entry as CatalogEntry).name ?? { 'en-US': bareId(id) }) as Record<string, string>,
        practiceCount: getCollectionItems(id).filter((i) => i.entry?.kind === 'practice').length,
      })
    }
    out.sort((a, b) => localizeContent(a.name).localeCompare(localizeContent(b.name)))
    return out
  }, [catalogVersion])

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('library.title')} />

        {collections.length === 0 ? (
          <YStack alignItems="center" gap="$sm" paddingVertical="$lg" paddingHorizontal="$lg">
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {t('library.emptyState')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
            >
              {t('library.registryOffline')}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$sm">
            {collections.map((c) => (
              <CollectionRowView
                key={c.id}
                entry={c}
                onPress={() =>
                  router.push({
                    pathname: '/browse/[collectionId]',
                    params: { collectionId: c.bareId },
                  })
                }
              />
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
