import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, TextInput, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { BookEntry } from '@/content/manifestTypes'
import { useDebounced } from '@/lib/useDebounced'
import type { BookSession, TocLeaf } from './bookContent'
import { loadSearchIndex } from './bookSearchIndex'
import { enrichSnippet, type SearchResult, searchBookContent } from './searchBook'

type Props = {
  open: boolean
  onClose: () => void
  bookId: string
  lang: string
  manifest: BookEntry | undefined
  session: BookSession | undefined
  leaves: TocLeaf[]
  titleLookup: Map<string, string>
  /** Called with the chapter index AND the original query so the host can
   *  jump-to-text inside the chapter. */
  onSelect: (chapterIndex: number, query: string) => void
}

const sheetFraction = 0.92
const QUERY_DEBOUNCE_MS = 200
const SNIPPET_LIMIT = 50

export function ReaderSearchSheet({
  open,
  onClose,
  bookId,
  lang,
  manifest,
  session,
  leaves,
  titleLookup,
  onSelect,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, QUERY_DEBOUNCE_MS)

  // Search index is heavy (≈12 MB for the encyclopedia); only fetch when the
  // sheet is actually open. Cache forever per (bookId, lang).
  const { data: index, isLoading: indexLoading } = useQuery({
    queryKey: ['book-search-index', bookId, lang],
    queryFn: () => loadSearchIndex(manifest as BookEntry, lang),
    enabled: open && !!manifest?.searchIndex?.[lang],
    staleTime: Number.POSITIVE_INFINITY,
  })

  const results = useMemo(
    () =>
      index
        ? searchBookContent(index, leaves, titleLookup, debouncedQuery)
        : ([] as SearchResult[]),
    [index, leaves, titleLookup, debouncedQuery],
  )

  // Top SNIPPET_LIMIT chapters fetched in parallel via the plain-text path
  // (skips image inlining). Snippets land in component state keyed by
  // chapterIndex so the FlatList renders them as they arrive.
  const [snippets, setSnippets] = useState<Map<number, ReturnType<typeof enrichSnippet>>>(
    () => new Map(),
  )
  useEffect(() => {
    setSnippets(new Map())
    if (!session || !debouncedQuery || results.length === 0) return
    let cancelled = false
    for (const r of results.slice(0, SNIPPET_LIMIT)) {
      session
        .getChapterPlain(r.chapterIndex)
        .then((body) => {
          if (cancelled) return
          const enriched = enrichSnippet(body, debouncedQuery, lang)
          setSnippets((prev) => new Map(prev).set(r.chapterIndex, enriched))
        })
        .catch((err) => {
          console.warn(`[ReaderSearchSheet] snippet ${r.chapterId} failed:`, err)
        })
    }
    return () => {
      cancelled = true
    }
  }, [session, debouncedQuery, results, lang])

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={() => {
        setQuery('')
        onClose()
      }}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} paddingTop="$md">
        <XStack alignItems="center" gap="$sm" paddingHorizontal="$lg" paddingBottom="$md">
          <Search size={18} color={theme.colorSecondary?.val} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder={t('books.searchPlaceholder', { defaultValue: 'Search this book…' })}
            placeholderTextColor={theme.colorSecondary?.val}
            clearButtonMode="while-editing"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.color?.val,
              paddingVertical: 6,
            }}
          />
        </XStack>

        {indexLoading ? (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
            paddingHorizontal="$lg"
            paddingBottom="$sm"
          >
            {t('books.preparingSearch', { defaultValue: 'Preparing search…' })}
          </Text>
        ) : debouncedQuery.length >= 2 ? (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
            paddingHorizontal="$lg"
            paddingBottom="$sm"
          >
            {results.length === 0
              ? t('books.searchNoResults', { defaultValue: 'No matches' })
              : t('books.searchResultsCount', {
                  defaultValue: '{{count}} matches',
                  count: results.length,
                })}
          </Text>
        ) : null}

        <FlatList
          data={results}
          keyExtractor={(r) => `${r.chapterIndex}:${r.chapterId}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => {
            const enriched = snippets.get(item.chapterIndex)
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.chapterIndex, debouncedQuery)
                  setQuery('')
                  onClose()
                }}
                accessibilityRole="button"
                accessibilityLabel={`${item.chapterTitle}: ${enriched?.snippet ?? ''}`}
              >
                <YStack
                  gap="$xs"
                  paddingVertical="$sm"
                  paddingHorizontal="$lg"
                  borderBottomWidth={0.5}
                  borderColor="$borderColor"
                >
                  <Text
                    fontFamily="$heading"
                    fontSize="$1"
                    color="$colorSecondary"
                    numberOfLines={1}
                  >
                    {item.chapterTitle}
                  </Text>
                  {enriched ? (
                    <Text fontFamily="$body" fontSize="$3" color="$color" numberOfLines={3}>
                      {enriched.snippet.slice(0, enriched.matchStart)}
                      <Text fontWeight="600" color="$accent">
                        {enriched.snippet.slice(enriched.matchStart, enriched.matchEnd)}
                      </Text>
                      {enriched.snippet.slice(enriched.matchEnd)}
                    </Text>
                  ) : (
                    <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" opacity={0.6}>
                      …
                    </Text>
                  )}
                </YStack>
              </Pressable>
            )
          }}
        />
      </YStack>
    </BottomSheet>
  )
}
