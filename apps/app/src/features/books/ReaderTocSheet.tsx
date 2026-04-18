import { ChevronDown, ChevronRight, X } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable } from '@/components'
import type { TocNode } from '@/content/sources/filesystem'
import { localizeContent } from '@/lib/i18n'

type Props = {
  toc: TocNode[]
  currentChapterId: string
  onSelectChapter: (id: string) => void
  onClose: () => void
}

type FlatTocItem = {
  node: TocNode
  depth: number
  isLeaf: boolean
  isExpanded: boolean
}

const itemHeight = 44

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

function collectInitialExpanded(toc: TocNode[], currentChapterId: string): Set<string> {
  const ids = new Set<string>()
  for (const node of toc) {
    if (node.children?.length) ids.add(node.id)
  }
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

export function ReaderTocSheet({ toc, currentChapterId, onSelectChapter, onClose }: Props) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [expandedIds, setExpandedIds] = useState(() =>
    collectInitialExpanded(toc, currentChapterId),
  )

  const flatItems = useMemo(() => flattenToc(toc, expandedIds), [toc, expandedIds])

  const currentIndex = useMemo(
    () => flatItems.findIndex((item) => item.node.id === currentChapterId),
    [flatItems, currentChapterId],
  )

  const handleSelect = useCallback(
    (id: string) => {
      onSelectChapter(id)
      onClose()
    },
    [onSelectChapter, onClose],
  )

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: FlatTocItem }) => {
      const { node, depth, isLeaf, isExpanded } = item
      const isCurrent = node.id === currentChapterId

      const title = localizeContent(node.title)

      if (isLeaf) {
        return (
          <AnimatedPressable
            onPress={() => handleSelect(node.id)}
            accessibilityRole="link"
            accessibilityLabel={title}
            accessibilityState={{ selected: isCurrent }}
          >
            <XStack
              height={itemHeight}
              alignItems="center"
              paddingHorizontal="$md"
              paddingLeft={16 + depth * 16}
              backgroundColor={isCurrent ? '$accentSubtle' : 'transparent'}
              borderRadius="$sm"
            >
              <Text
                fontFamily="$body"
                fontSize="$2"
                color={isCurrent ? '$accent' : '$color'}
                numberOfLines={2}
              >
                {title}
              </Text>
            </XStack>
          </AnimatedPressable>
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
            gap="$xs"
            paddingHorizontal="$md"
            paddingLeft={16 + depth * 16}
          >
            {isExpanded ? (
              <ChevronDown size={14} color={theme.colorSecondary.val} />
            ) : (
              <ChevronRight size={14} color={theme.colorSecondary.val} />
            )}
            <Text
              fontFamily="$heading"
              fontSize="$2"
              color="$colorSecondary"
              flex={1}
              numberOfLines={2}
            >
              {title}
            </Text>
          </XStack>
        </Pressable>
      )
    },
    [currentChapterId, handleSelect, toggleExpand, theme.colorSecondary.val],
  )

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInRight.duration(200)}
        exiting={SlideOutRight.duration(150)}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: 320,
          backgroundColor: theme.background.val,
          zIndex: 11,
          borderLeftWidth: 1,
          borderLeftColor: theme.borderColor.val,
        }}
      >
        <YStack flex={1} paddingTop="$lg">
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$md"
            paddingBottom="$md"
          >
            <Text fontFamily="$heading" fontSize="$4" color="$color">
              {t('library.tableOfContents')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.closeModal')}
            >
              <X size={20} color={theme.colorSecondary.val} />
            </Pressable>
          </XStack>

          <FlatList
            data={flatItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.node.id}
            getItemLayout={getItemLayout}
            initialScrollIndex={currentIndex > 0 ? currentIndex : undefined}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </YStack>
      </Animated.View>
    </>
  )
}
