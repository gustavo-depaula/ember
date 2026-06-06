import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, TextInput, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { useDebounced } from '@/lib/useDebounced'
import type { TocLeaf } from './bookContent'
import { type SearchResult, searchBookContent } from './searchBook'

type Props = {
  open: boolean
  onClose: () => void
  bodies: string[] | undefined
  leaves: TocLeaf[]
  titleLookup: Map<string, string>
  onSelect: (chapterIndex: number) => void
}

const sheetFraction = 0.92
const QUERY_DEBOUNCE_MS = 200

export function ReaderSearchSheet({ open, onClose, bodies, leaves, titleLookup, onSelect }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, QUERY_DEBOUNCE_MS)

  // Cheap on small books (< 1MB total HTML across chapters); for the largest
  // Aquinas books this scans tens of MB. Acceptable for an explicit user
  // action; revisit if it stalls the UI.
  const results = useMemo(
    () =>
      bodies
        ? searchBookContent(bodies, leaves, titleLookup, debouncedQuery)
        : ([] as SearchResult[]),
    [bodies, leaves, titleLookup, debouncedQuery],
  )

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
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.color?.val,
              paddingVertical: 6,
            }}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={18} color={theme.colorSecondary?.val} />
            </Pressable>
          ) : null}
        </XStack>

        {debouncedQuery.length >= 2 ? (
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
          keyExtractor={(r, i) => `${r.chapterIndex}:${i}:${r.matchStart}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item.chapterIndex)
                setQuery('')
                onClose()
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.chapterTitle}: ${item.snippet}`}
            >
              <YStack
                gap="$xs"
                paddingVertical="$sm"
                paddingHorizontal="$lg"
                borderBottomWidth={0.5}
                borderColor="$borderColor"
              >
                <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
                  {item.chapterTitle}
                </Text>
                <Text fontFamily="$body" fontSize="$3" color="$color" numberOfLines={3}>
                  {item.snippet.slice(0, item.matchStart)}
                  <Text fontWeight="600" color="$accent">
                    {item.snippet.slice(item.matchStart, item.matchEnd)}
                  </Text>
                  {item.snippet.slice(item.matchEnd)}
                </Text>
              </YStack>
            </Pressable>
          )}
        />
      </YStack>
    </BottomSheet>
  )
}
