import { useRouter } from 'expo-router'
import { memo, startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { practiceHref } from '../practiceHref'
import {
  buildSearchIndex,
  type SearchGroup,
  type SearchResult,
  searchGroups,
  searchIndex,
} from '../searchCatalog'

// A one-letter query matches nearly the whole corpus (~900 rows). The first
// rows render with the keystroke; the rest follow in interruptible chunks, so
// typing never waits on rows below the fold.
const firstRows = 20
const rowsPerChunk = 25

export function SearchAutocomplete({ query }: { query: string }) {
  const { t, i18n } = useTranslation()
  const catalogVersion = useCatalogVersion()
  // Keystrokes update the native field at once; results render behind them.
  const deferredQuery = useDeferredValue(query)

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as manifests warm; titles localize per language.
  const index = useMemo(buildSearchIndex, [catalogVersion, i18n.language])
  const results = useMemo(() => searchIndex(index, deferredQuery), [index, deferredQuery])

  const [shown, setShown] = useState(firstRows)
  const [shownFor, setShownFor] = useState(results)
  if (shownFor !== results) {
    setShownFor(results)
    setShown(firstRows)
  }
  useEffect(() => {
    if (shown >= results.length) return
    const timer = setTimeout(() => startTransition(() => setShown((n) => n + rowsPerChunk)), 0)
    return () => clearTimeout(timer)
  }, [shown, results.length])

  if (results.length === 0) {
    return (
      <YStack paddingVertical="$lg" alignItems="center">
        <Typography variant="caption" fontSize="$2">
          {t('catalog.noResults')}
        </Typography>
      </YStack>
    )
  }

  const labelKey: Record<SearchGroup, string> = {
    top: 'pray.searchResultTop',
    mentioned: 'pray.searchResultMentioned',
    practice: 'pray.searchResultPractices',
    book: 'pray.searchResultBooks',
    collection: 'pray.searchResultCollections',
    chant: 'pray.searchResultChants',
  }

  const visible = results.slice(0, shown)

  return (
    <YStack gap="$xl">
      {searchGroups.map((key) => {
        const group = visible.filter((hit) => hit.group === key)
        if (group.length === 0) return undefined
        const groupSize = results.filter((hit) => hit.group === key).length
        return (
          <YStack key={key} gap="$xs">
            <XStack alignItems="baseline" gap="$sm">
              <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                {t(labelKey[key])}
              </Typography>
              {key !== 'top' && <Typography variant="reference">{groupSize}</Typography>}
            </XStack>
            <YStack>
              {group.map(({ result, caption }, i) => (
                <ResultRow
                  key={`${result.kind}-${result.id}`}
                  result={result}
                  caption={caption}
                  isLast={i === groupSize - 1}
                />
              ))}
            </YStack>
          </YStack>
        )
      })}
    </YStack>
  )
}

// An index entry, not a card: a serif title over a hairline, with the author
// of a book, or the words that matched when the title is not them. No icons: a one-letter query renders hundreds of these, and each
// SVG glyph was most of a row's cost. Memoized — results are stable objects
// from the index, so a row still listed after the next keystroke is skipped.
const ResultRow = memo(function ResultRow({
  result,
  caption,
  isLast,
}: {
  result: SearchResult
  caption?: string
  isLast: boolean
}) {
  const subtitle =
    caption ?? (result.kind === 'book' || result.kind === 'chant' ? result.subtitle : undefined)
  const router = useRouter()

  function handlePress() {
    if (result.kind === 'practice') {
      router.push(practiceHref(result.id))
      return
    }
    if (result.kind === 'book') {
      router.push({ pathname: '/browse/book/[bookId]', params: { bookId: result.id } })
      return
    }
    if (result.kind === 'chant') {
      router.push({ pathname: '/browse/chant/[chantId]', params: { chantId: result.id } })
      return
    }
    router.push({ pathname: '/browse/[collectionId]', params: { collectionId: result.id } })
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={result.title}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <YStack
        minHeight={52}
        paddingVertical="$sm"
        justifyContent="center"
        gap={2}
        borderBottomWidth={isLast ? 0 : 0.5}
        borderBottomColor="$borderColor"
      >
        <Typography fontSize="$3" numberOfLines={2}>
          {result.title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" numberOfLines={1}>
            {subtitle}
          </Typography>
        )}
      </YStack>
    </Pressable>
  )
})
