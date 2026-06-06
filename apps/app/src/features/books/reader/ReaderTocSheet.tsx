import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, ChevronDown, ChevronRight } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { TocNode } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'

type Props = {
  open: boolean
  onClose: () => void
  toc: TocNode[]
  currentChapterId?: string
  /** Leaf ids the reader has finished — checkmark in the row. */
  completedChapterIds?: Set<string>
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

export function ReaderTocSheet({
  open,
  onClose,
  toc,
  currentChapterId,
  completedChapterIds,
  onSelect,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    collectInitialExpanded(toc, currentChapterId),
  )

  const flatItems = useMemo(() => flattenToc(toc, expandedIds), [toc, expandedIds])

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

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} width="100%" paddingTop="$md">
        <Text
          fontFamily="$heading"
          fontSize="$4"
          color="$color"
          paddingHorizontal="$lg"
          paddingBottom="$sm"
        >
          {t('books.tableOfContents')}
        </Text>
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
