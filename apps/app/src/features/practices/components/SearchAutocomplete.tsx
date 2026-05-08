import { useRouter } from 'expo-router'
import { BookOpen, FileText, Library as LibraryIcon } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import {
  getEntriesByKind,
  getRememberedManifest,
  isHiddenCollection,
  isHiddenPractice,
} from '@/content/contentIndex'
import type { BookItemManifest, PrayerItemManifest } from '@/content/manifestTypes'
import { getManifestIconKey, searchManifests } from '@/content/registry'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { localizeContent } from '@/lib/i18n'

type SearchResult =
  | { kind: 'practice'; id: string; title: string; iconKey: string }
  | { kind: 'prayer'; id: string; title: string }
  | { kind: 'book'; id: string; title: string; subtitle?: string }
  | { kind: 'collection'; id: string; title: string; iconKey: string }

type Scored<T> = { score: number; item: T }

const groupOrder: SearchResult['kind'][] = ['practice', 'prayer', 'book', 'collection']

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

// Higher score = more relevant. Title hits dominate over tag/description hits
// so a query like "rosário" surfaces "Santo Rosário" before practices that
// merely mention "rosary beads" in their description.
function scoreText(text: string | undefined, q: string): number {
  if (!text) return 0
  const t = text.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60
  return 0
}

function takeTopByScore<T>(scored: Scored<T>[]): T[] {
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item)
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
    const trimmed = query.trim()
    if (!trimmed) return { practice: [], prayer: [], book: [], collection: [] }

    const q = trimmed.toLowerCase()

    const practiceScored: Scored<SearchResult>[] = []
    for (const m of searchManifests(trimmed)) {
      if (isHiddenPractice(m.id)) continue
      const title = localizeContent(m.name)
      const titleScore = scoreText(title, q)
      const tagScore = m.tags?.some((tag) => tag.toLowerCase().includes(q)) ? 30 : 0
      const descScore =
        m.description && localizeContent(m.description).toLowerCase().includes(q) ? 10 : 0
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

    const prayerScored: Scored<SearchResult>[] = []
    for (const [id, entry] of getEntriesByKind('prayer')) {
      const body = getRememberedManifest<PrayerItemManifest>(entry.hash)
      const titleSrc = body?.title ?? entry.title ?? entry.name
      if (!titleSrc) continue
      const title = localizeContent(titleSrc as Record<string, string>)
      const score = scoreText(title, q)
      if (score === 0) continue
      prayerScored.push({ score, item: { kind: 'prayer', id: bareId(id), title } })
    }

    const bookScored: Scored<SearchResult>[] = []
    for (const [id, entry] of getEntriesByKind('book')) {
      const body = getRememberedManifest<BookItemManifest>(entry.hash)
      const nameSrc = body?.name ?? entry.name
      if (!nameSrc) continue
      const title = localizeContent(nameSrc as Record<string, string>)
      const authorSrc = body?.author ?? entry.author
      const author = authorSrc ? localizeContent(authorSrc as Record<string, string>) : ''
      const score = Math.max(scoreText(title, q), scoreText(author, q) > 0 ? 50 : 0)
      if (score === 0) continue
      bookScored.push({
        score,
        item: { kind: 'book', id: bareId(id), title, subtitle: author || undefined },
      })
    }

    const collectionScored: Scored<SearchResult>[] = []
    for (const [id, entry] of getEntriesByKind('collection')) {
      if (isHiddenCollection(id)) continue
      const title = entry.name ? localizeContent(entry.name) : bareId(id)
      const score = scoreText(title, q)
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
      prayer: takeTopByScore(prayerScored) as Extract<SearchResult, { kind: 'prayer' }>[],
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
