import { useRouter } from 'expo-router'
import { BookOpen, FileText, Library as LibraryIcon } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import { getEntriesByKind, isHiddenCollection, isHiddenPractice } from '@/content/contentIndex'
import { getManifestIconKey, searchManifests } from '@/content/registry'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

type SearchResult =
  | { kind: 'practice'; id: string; title: string; iconKey: string }
  | { kind: 'prayer'; id: string; title: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string; iconKey: string }

const groupOrder: SearchResult['kind'][] = ['practice', 'prayer', 'book', 'collection']

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function SearchAutocomplete({
  query,
  onSelectPrayer,
}: {
  query: string
  onSelectPrayer: (prayerId: string) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred manifests warm.
  const grouped = useMemo<Record<SearchResult['kind'], SearchResult[]>>(() => {
    const buckets: Record<SearchResult['kind'], SearchResult[]> = {
      practice: [],
      prayer: [],
      book: [],
      collection: [],
    }
    const trimmed = query.trim()
    if (!trimmed) return buckets

    const q = trimmed.toLowerCase()

    for (const m of searchManifests(trimmed)) {
      if (isHiddenPractice(m.id)) continue
      buckets.practice.push({
        kind: 'practice',
        id: m.id,
        title: localizeContent(m.name),
        iconKey: getManifestIconKey(m.id),
      })
    }

    for (const [id, entry] of getEntriesByKind('prayer')) {
      const title = entry.title
        ? localizeContent(entry.title)
        : entry.name
          ? localizeContent(entry.name)
          : bareId(id)
      if (title.toLowerCase().includes(q)) {
        buckets.prayer.push({ kind: 'prayer', id: bareId(id), title })
      }
    }

    for (const [id, entry] of getEntriesByKind('book')) {
      const title = entry.name ? localizeContent(entry.name) : bareId(id)
      const author = entry.author ? localizeContent(entry.author) : ''
      if (title.toLowerCase().includes(q) || author.toLowerCase().includes(q)) {
        buckets.book.push({
          kind: 'book',
          id: bareId(id),
          title,
          subtitle: author || undefined,
        })
      }
    }

    for (const [id, entry] of getEntriesByKind('collection')) {
      if (isHiddenCollection(id)) continue
      const title = entry.name ? localizeContent(entry.name) : bareId(id)
      if (title.toLowerCase().includes(q)) {
        buckets.collection.push({
          kind: 'collection',
          id: bareId(id),
          title,
          iconKey: (entry.icon as string | undefined) ?? 'book',
        })
      }
    }

    return buckets
  }, [query, catalogVersion])

  const totalCount = groupOrder.reduce((sum, kind) => sum + grouped[kind].length, 0)

  if (totalCount === 0) {
    return (
      <YStack paddingVertical="$lg" alignItems="center">
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          {t('catalog.noResults')}
        </Text>
      </YStack>
    )
  }

  function handlePress(result: SearchResult) {
    if (result.kind === 'practice') {
      router.push({ pathname: '/practices/[manifestId]', params: { manifestId: result.id } })
      return
    }
    if (result.kind === 'prayer') {
      onSelectPrayer(result.id)
      return
    }
    if (result.kind === 'book') {
      router.push({ pathname: '/browse/book/[bookId]', params: { bookId: result.id } })
      return
    }
    router.push({ pathname: '/browse/[libraryId]', params: { libraryId: result.id } })
  }

  function renderRow(result: SearchResult) {
    const leading = (() => {
      if (result.kind === 'practice') return <PracticeIcon name={result.iconKey} size={20} />
      if (result.kind === 'prayer') return <FileText size={18} color={theme.colorSecondary?.val} />
      if (result.kind === 'book') return <BookOpen size={18} color={theme.accent?.val} />
      return <LibraryIcon size={18} color={theme.accent?.val} />
    })()

    return (
      <Pressable
        key={`${result.kind}-${result.id}`}
        onPress={() => handlePress(result)}
        accessibilityRole="link"
        accessibilityLabel={result.title}
      >
        <XStack
          padding="$sm"
          paddingHorizontal="$md"
          gap="$md"
          alignItems="center"
          borderRadius="$md"
          backgroundColor="$backgroundSurface"
          borderWidth={1}
          borderColor="$borderColor"
        >
          {leading}
          <YStack flex={1} gap={2}>
            <Text fontFamily="$body" fontSize="$2" color="$color" numberOfLines={1}>
              {result.title}
            </Text>
            {result.kind === 'book' && result.subtitle && (
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
                {result.subtitle}
              </Text>
            )}
          </YStack>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
            ›
          </Text>
        </XStack>
      </Pressable>
    )
  }

  const labelKey: Record<SearchResult['kind'], string> = {
    practice: 'pray.searchResultPractices',
    prayer: 'pray.searchResultPrayers',
    book: 'pray.searchResultBooks',
    collection: 'pray.searchResultCollections',
  }

  return (
    <YStack gap="$md">
      {groupOrder.map((kind) => {
        const results = grouped[kind]
        if (results.length === 0) return undefined
        return (
          <YStack key={kind} gap="$xs">
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="$colorSecondary"
              letterSpacing={1}
              textTransform="uppercase"
            >
              {t(labelKey[kind])}
            </Text>
            <YStack gap="$xs">{results.map(renderRow)}</YStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
