/**
 * Recursive section renderer for a Collection. Top-level usage:
 *
 *   <SectionList collectionId={collectionId} sections={manifest.sections} ... />
 *
 * Each section renders as a tappable header (chevron + title + leaf-item
 * count) followed by, when expanded, its blocks. Blocks may be:
 *   - { kind: 'item' }    → <ItemCard>
 *   - { kind: 'section' } → nested <SectionView> (depth-2 cap, set by author)
 *   - { kind: 'prose' }   → not rendered in Phase 1 (selective prose ships
 *                           in Phase 3)
 */

import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { Pressable, type View } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ProseBlock as PrayerProseBlock } from '@/components/prayer'
import type {
  CollectionBlock,
  CollectionProseBody,
  CollectionSection,
} from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

import { collapseKey, useCollapseStore } from './collapseStore'
import { ItemCard } from './ItemCard'
import { TodoCard } from './TodoCard'

export function CollectionProse({ prose }: { prose: CollectionProseBody }) {
  const text = localizeContent(prose.body)
  if (!text) return null
  return <PrayerProseBlock text={{ primary: text }} />
}

function countLeafItems(blocks: CollectionBlock[] | undefined): number {
  if (!blocks) return 0
  let n = 0
  for (const b of blocks) {
    if (b.kind === 'item') n++
    else if (b.kind === 'section') n += countLeafItems(b.blocks)
  }
  return n
}

export function SectionList({
  collectionId,
  sections,
  onOpenPrayer,
  onSeeAlsoTap,
  registerItemRef,
}: {
  collectionId: string
  sections: CollectionSection[]
  onOpenPrayer: (prayerId: string) => void
  onSeeAlsoTap: (ref: string) => void
  registerItemRef?: (ref: string, node: View | null) => void
}) {
  return (
    <YStack gap="$md">
      {sections.map((section) => (
        <SectionView
          key={section.id}
          collectionId={collectionId}
          section={section}
          depth={0}
          onOpenPrayer={onOpenPrayer}
          onSeeAlsoTap={onSeeAlsoTap}
          registerItemRef={registerItemRef}
        />
      ))}
    </YStack>
  )
}

export function SectionView({
  collectionId,
  section,
  depth,
  onOpenPrayer,
  onSeeAlsoTap,
  registerItemRef,
}: {
  collectionId: string
  section: CollectionSection
  depth: number
  onOpenPrayer: (prayerId: string) => void
  onSeeAlsoTap: (ref: string) => void
  registerItemRef?: (ref: string, node: View | null) => void
}) {
  const theme = useTheme()
  const key = collapseKey(collectionId, section.id)
  const defaultCollapsed = section.defaultCollapsed ?? false
  const collapsed = useCollapseStore((s) => s.isCollapsed(key, defaultCollapsed))
  const toggle = useCollapseStore((s) => s.toggle)

  const titleSize = depth === 0 ? '$4' : '$3'
  const itemCount = countLeafItems(section.blocks)

  return (
    <YStack gap="$sm" paddingLeft={depth > 0 ? '$md' : 0}>
      <Pressable
        onPress={() => toggle(key, defaultCollapsed)}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
        accessibilityLabel={localizeContent(section.title)}
      >
        <XStack alignItems="center" gap="$sm" paddingVertical="$xs">
          {collapsed ? (
            <ChevronRight size={18} color={theme.colorSecondary?.val} />
          ) : (
            <ChevronDown size={18} color={theme.colorSecondary?.val} />
          )}
          <Text flex={1} fontFamily="$heading" fontSize={titleSize} color="$color">
            {localizeContent(section.title)}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            ({itemCount})
          </Text>
        </XStack>
      </Pressable>
      {!collapsed && (
        <YStack gap="$sm">
          {section.description && (
            <YStack paddingBottom="$xs">
              <CollectionProse prose={section.description} />
            </YStack>
          )}
          <YStack gap="$xs">
            {section.blocks.map((block, idx) => (
              <BlockView
                // biome-ignore lint/suspicious/noArrayIndexKey: blocks are positional; refs may repeat
                key={idx}
                collectionId={collectionId}
                block={block}
                depth={depth}
                onOpenPrayer={onOpenPrayer}
                onSeeAlsoTap={onSeeAlsoTap}
                registerItemRef={registerItemRef}
              />
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  )
}

function BlockView({
  collectionId,
  block,
  depth,
  onOpenPrayer,
  onSeeAlsoTap,
  registerItemRef,
}: {
  collectionId: string
  block: CollectionBlock
  depth: number
  onOpenPrayer: (prayerId: string) => void
  onSeeAlsoTap: (ref: string) => void
  registerItemRef?: (ref: string, node: View | null) => void
}) {
  if (block.kind === 'item') {
    return (
      <YStack ref={(node) => registerItemRef?.(block.ref, node as unknown as View | null)}>
        <ItemCard item={block} onOpenPrayer={onOpenPrayer} onSeeAlsoTap={onSeeAlsoTap} />
      </YStack>
    )
  }
  if (block.kind === 'section') {
    return (
      <SectionView
        collectionId={collectionId}
        section={block}
        depth={depth + 1}
        onOpenPrayer={onOpenPrayer}
        onSeeAlsoTap={onSeeAlsoTap}
        registerItemRef={registerItemRef}
      />
    )
  }
  if (block.kind === 'prose') {
    return (
      <YStack paddingVertical="$xs">
        <CollectionProse prose={block.body} />
      </YStack>
    )
  }
  if (block.kind === 'todo') {
    return <TodoCard todo={block} />
  }
  return null
}
