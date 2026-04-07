import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Pressable } from 'react-native'
import { ScrollView, Text, useTheme, XStack, YStack } from 'tamagui'

import type { CccSegment } from '../segments'

type TocNode = {
  label: string
  depth: number
  firstSegmentIndex: number
  children: TocNode[]
}

function buildTocTree(segments: CccSegment[]): TocNode[] {
  const roots: TocNode[] = []
  // Map from breadcrumb path key to its node for O(1) lookup
  const nodeMap = new Map<string, TocNode>()

  for (const seg of segments) {
    const bc = seg.breadcrumb
    let siblings = roots

    for (let depth = 0; depth < bc.length; depth++) {
      const pathKey = bc.slice(0, depth + 1).join('\0')
      let node = nodeMap.get(pathKey)

      if (!node) {
        node = {
          label: bc[depth],
          depth,
          firstSegmentIndex: seg.index,
          children: [],
        }
        nodeMap.set(pathKey, node)
        siblings.push(node)
      }

      siblings = node.children
    }
  }

  return roots
}

function nodeKey(node: TocNode, parentPath: string): string {
  return `${parentPath}/${node.label}`
}

function isAncestorOf(node: TocNode, segment: CccSegment): boolean {
  return segment.breadcrumb[node.depth] === node.label
}

function TocNodeRow({
  node,
  path,
  expanded,
  toggleExpanded,
  currentSegment,
  onSelectSegment,
}: {
  node: TocNode
  path: string
  expanded: Record<string, boolean>
  toggleExpanded: (key: string) => void
  currentSegment: CccSegment | undefined
  onSelectSegment: (index: number) => void
}) {
  const theme = useTheme()
  const key = nodeKey(node, path)
  const hasChildren = node.children.length > 0
  const isExpanded = expanded[key] ?? false
  const isCurrent = currentSegment ? isAncestorOf(node, currentSegment) : false
  const indent = 16 + node.depth * 20

  // Depth 0 = Part (header style), deeper = navigable items
  const isPartHeader = node.depth === 0

  return (
    <YStack>
      <Pressable
        onPress={() => {
          if (hasChildren) {
            toggleExpanded(key)
          } else {
            onSelectSegment(node.firstSegmentIndex)
          }
        }}
        style={({ pressed }) => ({
          backgroundColor: pressed ? 'rgba(128,128,128,0.15)' : 'transparent',
        })}
      >
        <XStack
          paddingVertical={isPartHeader ? 12 : 8}
          paddingRight="$md"
          paddingLeft={indent}
          alignItems="center"
          gap="$xs"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={12} color={theme.colorSecondary.val} />
            ) : (
              <ChevronRight size={12} color={theme.colorSecondary.val} />
            )
          ) : (
            <XStack width={12} />
          )}
          <Text
            fontFamily={isPartHeader ? '$heading' : '$body'}
            fontSize={isPartHeader ? '$1' : '$2'}
            fontWeight={isCurrent ? '600' : '400'}
            color={isCurrent ? '$color' : '$colorSecondary'}
            flex={1}
            numberOfLines={2}
            textTransform={isPartHeader ? 'uppercase' : 'none'}
            letterSpacing={isPartHeader ? 0.5 : 0}
          >
            {node.label}
          </Text>
        </XStack>
      </Pressable>

      {isExpanded &&
        node.children.map((child) => (
          <TocNodeRow
            key={nodeKey(child, key)}
            node={child}
            path={key}
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            currentSegment={currentSegment}
            onSelectSegment={onSelectSegment}
          />
        ))}
    </YStack>
  )
}

export function TocTree({
  segments,
  currentSegmentIndex,
  onSelectSegment,
}: {
  segments: CccSegment[]
  currentSegmentIndex: number
  onSelectSegment: (index: number) => void
}) {
  const tree = useMemo(() => buildTocTree(segments), [segments])
  const currentSegment = segments[currentSegmentIndex]

  // Auto-expand the path to the current segment
  const initialExpanded = useMemo(() => {
    const keys: Record<string, boolean> = {}
    if (!currentSegment) return keys

    const bc = currentSegment.breadcrumb
    let path = ''
    for (let i = 0; i < bc.length; i++) {
      const key = `${path}/${bc[i]}`
      keys[key] = true
      path = key
    }
    return keys
  }, [currentSegment])

  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded)

  // Keep track of whether we've synced to initial state
  const lastSegmentRef = useRef(currentSegmentIndex)
  if (lastSegmentRef.current !== currentSegmentIndex) {
    lastSegmentRef.current = currentSegmentIndex
    // Auto-expand path to new segment without collapsing others
    if (currentSegment) {
      const bc = currentSegment.breadcrumb
      let path = ''
      const updates: Record<string, boolean> = {}
      for (let i = 0; i < bc.length; i++) {
        const key = `${path}/${bc[i]}`
        updates[key] = true
        path = key
      }
      if (Object.keys(updates).some((k) => !expanded[k])) {
        setExpanded((prev) => ({ ...prev, ...updates }))
      }
    }
  }

  const toggleExpanded = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return (
    <ScrollView flex={1}>
      <YStack paddingBottom="$xl">
        {tree.map((node) => (
          <TocNodeRow
            key={nodeKey(node, '')}
            node={node}
            path=""
            expanded={expanded}
            toggleExpanded={toggleExpanded}
            currentSegment={currentSegment}
            onSelectSegment={onSelectSegment}
          />
        ))}
      </YStack>
    </ScrollView>
  )
}
