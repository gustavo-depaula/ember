import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { getEntriesByKind, getRememberedManifest } from '@/content/contentIndex'
import type { PrayerItemManifest } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

const initialChunk = 12

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function AllPrayersList({ onSelect }: { onSelect: (prayerId: string) => void }) {
  const { t } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const [showAll, setShowAll] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred prayer manifests warm.
  const prayers = useMemo(() => {
    const out: { id: string; title: string }[] = []
    for (const [id, entry] of getEntriesByKind('prayer')) {
      const body = getRememberedManifest<PrayerItemManifest>(entry.hash)
      const titleSrc = body?.title ?? entry.title ?? entry.name
      if (!titleSrc) continue
      const title = localizeContent(titleSrc as Record<string, string>).trim()
      if (!title) continue
      out.push({ id: bareId(id), title })
    }
    out.sort((a, b) => a.title.localeCompare(b.title))
    return out
  }, [catalogVersion])

  if (prayers.length === 0) return undefined

  const visible = showAll ? prayers : prayers.slice(0, initialChunk)
  const hasMore = prayers.length > visible.length

  return (
    <YStack gap="$xs">
      {visible.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => onSelect(p.id)}
          accessibilityRole="button"
          accessibilityLabel={p.title}
        >
          <XStack
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$md"
            backgroundColor="$backgroundSurface"
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            gap="$md"
          >
            <Text flex={1} fontFamily="$body" fontSize="$2" color="$color" numberOfLines={1}>
              {p.title}
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
              ›
            </Text>
          </XStack>
        </Pressable>
      ))}
      {hasMore && (
        <Pressable
          onPress={() => setShowAll(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('pray.showAllPrayers')}
        >
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$accent"
            paddingVertical="$sm"
            paddingHorizontal="$md"
          >
            {t('pray.showAllPrayers', { count: prayers.length })}
          </Text>
        </Pressable>
      )}
    </YStack>
  )
}
