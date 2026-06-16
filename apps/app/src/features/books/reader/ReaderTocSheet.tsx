import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, ChevronDown, ChevronRight, Search } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, TextInput, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { TocNode } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { useDebounced } from '@/lib/useDebounced'
import { collectAllSectionIds, hasNestedSections } from './bookContent'
import type { ChapterTiming } from './chapterTimings'

type Props = {
  open: boolean
  onClose: () => void
  toc: TocNode[]
  currentChapterId?: string
  /** Leaf ids the reader has finished — checkmark in the row. */
  completedChapterIds?: Set<string>
  /** chapterId → estimated word count + minutes; renders as "5 min" beside the row. */
  chapterTimings?: Map<string, ChapterTiming>
  onSelect: (chapterId: string) => void
}

type FlatTocItem = {
  node: TocNode
  depth: number
  isLeaf: boolean
  isExpanded: boolean
}

const itemHeight = 48
const sheetFraction = 0.85

function flattenToc(nodes: TocNode[], expandedIds: Set<string>, depth = 0): FlatTocItem[] {
  const result: FlatTocItem[] = []
  for (const node of nodes) {
    const isLeaf = !node.children?.length
    const isExpanded = !isLeaf && expandedIds.has(node.id)
    result.push({ node, depth, isLeaf, isExpanded })
    if (isExpanded && node.children) {
      result.push(...flattenToc(node.children, expandedIds, depth + 1))
    }
  }
  return result
}

// Auto-expand the ancestor chain of the current chapter so the user opens the
// TOC and immediately sees where they are.
function collectInitialExpanded(toc: TocNode[], currentChapterId?: string): Set<string> {
  const ids = new Set<string>()
  for (const node of toc) {
    if (node.children?.length) ids.add(node.id)
  }
  if (!currentChapterId) return ids
  function findAncestors(nodes: TocNode[], path: string[]): boolean {
    for (const node of nodes) {
      if (node.id === currentChapterId) return true
      if (node.children?.length) {
        path.push(node.id)
        if (findAncestors(node.children, path)) return true
        path.pop()
      }
    }
    return false
  }
  const path: string[] = []
  findAncestors(toc, path)
  for (const id of path) ids.add(id)
  return ids
}

function getItemLayout(_: unknown, index: number) {
  return { length: itemHeight, offset: itemHeight * index, index }
}

/** Flatten all leaves + sections (depth 0) — used when filtering by query. */
function flattenAllLeaves(toc: TocNode[]): FlatTocItem[] {
  const out: FlatTocItem[] = []
  function walk(nodes: TocNode[]) {
    for (const node of nodes) {
      const isLeaf = !node.children?.length
      out.push({ node, depth: 0, isLeaf, isExpanded: false })
      if (!isLeaf && node.children) walk(node.children)
    }
  }
  walk(toc)
  return out
}

export function ReaderTocSheet({
  open,
  onClose,
  toc,
  currentChapterId,
  completedChapterIds,
  chapterTimings,
  onSelect,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    collectInitialExpanded(toc, currentChapterId),
  )

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, 150)
  const trimmedQuery = debouncedQuery.trim().toLowerCase()

  const flatItems = useMemo(() => {
    const all = flattenToc(toc, expandedIds)
    if (trimmedQuery.length < 2) return all
    // Flat list of matches across the whole tree (depth set to 0 so all
    // matches read at the same indent — the query already narrows context).
    return flattenAllLeaves(toc).filter((item) =>
      localizeContent(item.node.title).toLowerCase().includes(trimmedQuery),
    )
  }, [toc, expandedIds, trimmedQuery])

  const currentIndex = useMemo(
    () => flatItems.findIndex((i) => i.node.id === currentChapterId),
    [flatItems, currentChapterId],
  )

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = useCallback(() => setExpandedIds(collectAllSectionIds(toc)), [toc])
  const collapseAll = useCallback(() => setExpandedIds(new Set()), [])

  const showExpandControls = useMemo(() => hasNestedSections(toc), [toc])

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} width="100%" paddingTop="$md">
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$lg"
          paddingBottom="$sm"
        >
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('books.tableOfContents')}
          </Text>
          {showExpandControls ? (
            <XStack gap="$md">
              <Pressable onPress={expandAll} hitSlop={8} accessibilityRole="button">
                <Text fontFamily="$body" fontSize="$1" color="$accent">
                  {t('books.expandAll', { defaultValue: 'Expand all' })}
                </Text>
              </Pressable>
              <Pressable onPress={collapseAll} hitSlop={8} accessibilityRole="button">
                <Text fontFamily="$body" fontSize="$1" color="$accent">
                  {t('books.collapseAll', { defaultValue: 'Collapse all' })}
                </Text>
              </Pressable>
            </XStack>
          ) : null}
        </XStack>
        <XStack
          alignItems="center"
          gap="$sm"
          paddingHorizontal="$lg"
          paddingBottom="$sm"
          opacity={0.85}
        >
          <Search size={16} color={theme.colorSecondary?.val} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('books.tocSearchPlaceholder', { defaultValue: 'Filter chapters…' })}
            placeholderTextColor={theme.colorSecondary?.val}
            clearButtonMode="while-editing"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            style={{ flex: 1, fontSize: 14, color: theme.color?.val, paddingVertical: 4 }}
          />
        </XStack>
        <FlatList
          data={flatItems}
          keyExtractor={(item) => item.node.id}
          getItemLayout={getItemLayout}
          initialScrollIndex={currentIndex > 0 ? currentIndex : undefined}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => {
            const { node, depth, isLeaf, isExpanded } = item
            const isCurrent = node.id === currentChapterId
            const title = localizeContent(node.title)
            if (isLeaf) {
              const isCompleted = completedChapterIds?.has(node.id) ?? false
              const timing = chapterTimings?.get(node.id)
              return (
                <Pressable
                  onPress={() => onSelect(node.id)}
                  accessibilityRole="link"
                  accessibilityLabel={title}
                  accessibilityState={{ selected: isCurrent, checked: isCompleted }}
                >
                  <XStack
                    height={itemHeight}
                    alignItems="center"
                    gap="$sm"
                    paddingHorizontal="$lg"
                    paddingLeft={24 + depth * 16}
                    backgroundColor={isCurrent ? '$accentSubtle' : 'transparent'}
                  >
                    <Text
                      fontFamily="$body"
                      fontSize="$3"
                      color={isCurrent ? '$accent' : '$color'}
                      numberOfLines={2}
                      flex={1}
                      opacity={isCompleted && !isCurrent ? 0.55 : 1}
                    >
                      {title}
                    </Text>
                    {node.pointRange ? (
                      <Text
                        fontFamily="$body"
                        fontSize="$1"
                        color="$colorSecondary"
                        opacity={0.8}
                        fontVariant={['tabular-nums']}
                      >
                        {`${node.pointRange.from}–${node.pointRange.to}`}
                      </Text>
                    ) : null}
                    {timing && timing.minutes > 0 ? (
                      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                        {`${timing.minutes} min`}
                      </Text>
                    ) : null}
                    {isCompleted ? (
                      <Check size={14} color={theme.accent?.val ?? theme.colorSecondary?.val} />
                    ) : null}
                  </XStack>
                </Pressable>
              )
            }
            return (
              <Pressable
                onPress={() => toggleExpand(node.id)}
                accessibilityRole="button"
                accessibilityLabel={title}
                accessibilityState={{ expanded: isExpanded }}
              >
                <XStack
                  height={itemHeight}
                  alignItems="center"
                  gap="$sm"
                  paddingHorizontal="$lg"
                  paddingLeft={16 + depth * 16}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} color={theme.colorSecondary?.val} />
                  ) : (
                    <ChevronRight size={16} color={theme.colorSecondary?.val} />
                  )}
                  <Text
                    fontFamily="$heading"
                    fontSize="$2"
                    color="$colorSecondary"
                    numberOfLines={2}
                    flex={1}
                  >
                    {title}
                  </Text>
                </XStack>
              </Pressable>
            )
          }}
        />
      </YStack>
    </BottomSheet>
  )
}
