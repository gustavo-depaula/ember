import { useRouter } from 'expo-router'
import { BookOpen, ChevronRight, Library as LibraryIcon } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import { Typography } from '@/components/typography'
import { getEntriesByKind, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry } from '@/content/manifestTypes'
import { getManifestIconKey, searchManifests } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'
import { fuzzyScore, normalizeForSearch } from '@/lib/search'

type SearchResult =
  | { kind: 'practice'; id: string; title: string; iconKey: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string; iconKey: string }

type Scored<T> = { score: number; item: T }

const groupOrder: SearchResult['kind'][] = ['practice', 'collection', 'book']

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

function takeTopByScore<T>(scored: Scored<T>[]): T[] {
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item)
}

export function SearchAutocomplete({ query }: { query: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as deferred manifests warm.
  const grouped = useMemo<Record<SearchResult['kind'], SearchResult[]>>(() => {
    const trimmed = query.trim()
    if (!trimmed) return { practice: [], book: [], collection: [] }

    const q = normalizeForSearch(trimmed)

    const practiceScored: Scored<SearchResult>[] = []
    for (const m of searchManifests(trimmed)) {
      const title = localizeContent(m.name)
      const titleScore = fuzzyScore(title, q)
      const tagScore = m.tags?.some((tag) => normalizeForSearch(tag).includes(q)) ? 30 : 0
      const descScore =
        m.description && normalizeForSearch(localizeContent(m.description)).includes(q) ? 10 : 0
      const score = Math.max(titleScore, tagScore, descScore)
      if (score === 0) continue
      practiceScored.push({
        score,
        item: {
          kind: 'practice',
          id: m.id,
          title,
          iconKey: getManifestIconKey(m.id),
        },
      })
    }

    const bookScored: Scored<SearchResult>[] = []
    for (const [id, entry] of getEntriesByKind('book')) {
      const body = getRememberedManifest<BookEntry>(entry.hash)
      const nameSrc = body?.name ?? entry.name
      if (!nameSrc) continue
      const title = localizeContent(nameSrc as Record<string, string>)
      const authorSrc = body?.author ?? entry.author
      const author = authorSrc ? localizeContent(authorSrc as Record<string, string>) : ''
      const score = Math.max(fuzzyScore(title, q), fuzzyScore(author, q) > 0 ? 50 : 0)
      if (score === 0) continue
      bookScored.push({
        score,
        item: { kind: 'book', id: bareId(id), title, subtitle: author || undefined },
      })
    }

    const collectionScored: Scored<SearchResult>[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      const title = entry.name ? localizeContent(entry.name) : bareId(id)
      const score = fuzzyScore(title, q)
      if (score === 0) continue
      collectionScored.push({
        score,
        item: {
          kind: 'collection',
          id: bareId(id),
          title,
          iconKey: (entry.icon as string | undefined) ?? 'book',
        },
      })
    }

    return {
      practice: takeTopByScore(practiceScored) as Extract<SearchResult, { kind: 'practice' }>[],
      book: takeTopByScore(bookScored) as Extract<SearchResult, { kind: 'book' }>[],
      collection: takeTopByScore(collectionScored) as Extract<
        SearchResult,
        { kind: 'collection' }
      >[],
    }
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
    if (result.kind === 'book') {
      router.push({ pathname: '/browse/book/[bookId]', params: { bookId: result.id } })
      return
    }
    router.push({ pathname: '/browse/[collectionId]', params: { collectionId: result.id } })
  }

  function renderRow(result: SearchResult, isLast: boolean) {
    const leading = (() => {
      if (result.kind === 'practice') return <PracticeIcon name={result.iconKey} size={22} />
      if (result.kind === 'book') return <BookOpen size={20} color={theme.accent?.val} />
      return <LibraryIcon size={20} color={theme.accent?.val} />
    })()

    return (
      <Pressable
        key={`${result.kind}-${result.id}`}
        onPress={() => handlePress(result)}
        accessibilityRole="link"
        accessibilityLabel={result.title}
      >
        <XStack
          minHeight={64}
          paddingVertical="$md"
          gap="$md"
          alignItems="center"
          borderBottomWidth={isLast ? 0 : 0.5}
          borderColor="$accentSubtle"
        >
          <YStack width={26} alignItems="center">
            {leading}
          </YStack>
          <YStack flex={1} gap={1}>
            <Text fontFamily="$heading" fontSize="$3" color="$color" numberOfLines={1}>
              {result.title}
            </Text>
            {result.kind === 'book' && result.subtitle && (
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
                {result.subtitle}
              </Text>
            )}
          </YStack>
          <ChevronRight size={16} color={theme.accent?.val} />
        </XStack>
      </Pressable>
    )
  }

  const labelKey: Record<SearchResult['kind'], string> = {
    practice: 'pray.searchResultPractices',
    book: 'pray.searchResultBooks',
    collection: 'pray.searchResultCollections',
  }

  return (
    <YStack gap="$lg">
      {groupOrder.map((kind) => {
        const results = grouped[kind]
        if (results.length === 0) return undefined
        return (
          <YStack key={kind} gap="$xs">
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {t(labelKey[kind])}
            </Typography>
            <YStack>{results.map((r, i) => renderRow(r, i === results.length - 1))}</YStack>
          </YStack>
        )
      })}
    </YStack>
  )
}
