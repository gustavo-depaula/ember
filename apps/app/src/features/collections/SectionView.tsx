/**
 * Flat, open renderer for a Collection — the "curated room". No accordion:
 * every section is always visible, introduced by an illuminated marker (a gold
 * fleuron + tracked caps + a thin rule) and a quiet intro line.
 *
 * Items render as self-contained jewel tiles (see CollectionTile): a section of
 * readings becomes a horizontal cover shelf; a section of practices becomes a
 * two-column grid of square cards. Any non-item blocks (prose, nested section,
 * editorial todo) stack vertically beneath.
 */

import { XStack, YStack } from 'tamagui'

import { ProseBlock as PrayerProseBlock } from '@/components/prayer'
import { Typography } from '@/components/typography'
import type {
  CollectionBlock,
  CollectionItem,
  CollectionProseBody,
  CollectionSection,
} from '@/content/manifestTypes'
import { CardRow } from '@/features/explore/CardRow'
import { localizeContent } from '@/lib/i18n'

import { CollectionTile } from './CollectionTile'
import { TodoCard } from './TodoCard'

export function CollectionProse({ prose }: { prose: CollectionProseBody }) {
  const text = localizeContent(prose.body)
  if (!text) return null
  return <PrayerProseBlock text={{ primary: text }} />
}

type ItemBlock = { kind: 'item' } & CollectionItem

export function SectionList({
  collectionId,
  sections,
}: {
  collectionId: string
  sections: CollectionSection[]
}) {
  return (
    <YStack gap="$xl">
      {sections.map((section) => (
        <SectionView key={section.id} collectionId={collectionId} section={section} depth={0} />
      ))}
    </YStack>
  )
}

export function SectionView({
  collectionId,
  section,
  depth,
}: {
  collectionId: string
  section: CollectionSection
  depth: number
}) {
  const itemBlocks = section.blocks.filter((b): b is ItemBlock => b.kind === 'item')
  const otherBlocks = section.blocks.filter((b) => b.kind !== 'item')

  return (
    <YStack gap="$md" paddingLeft={depth > 0 ? '$md' : 0}>
      <SectionMarker title={localizeContent(section.title)} depth={depth} />

      {section.description && (
        <Typography variant="interface" tone="muted" fontSize={15} fontStyle="italic">
          {localizeContent(section.description.body)}
        </Typography>
      )}

      {itemBlocks.length > 0 && (
        <CardRow>
          {itemBlocks.map((b) => (
            <CollectionTile key={b.ref} item={b} width={140} aspectRatio={10 / 12} />
          ))}
        </CardRow>
      )}

      {otherBlocks.length > 0 && (
        <YStack gap="$sm">
          {otherBlocks.map((block, idx) => (
            <BlockView
              // biome-ignore lint/suspicious/noArrayIndexKey: positional editorial blocks
              key={idx}
              collectionId={collectionId}
              block={block}
              depth={depth}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}

function SectionMarker({ title, depth }: { title: string; depth: number }) {
  // An untitled section (e.g. a user collection's single default section) reads
  // as a flat jewel grid — no fleuron heading.
  if (!title) return null
  if (depth > 0) {
    return (
      <Typography variant="label" fontSize="$2" paddingTop="$sm">
        {title}
      </Typography>
    )
  }
  return (
    <XStack alignItems="center" gap="$sm" paddingTop="$sm">
      <Typography fontSize="$1">✦</Typography>
      <Typography variant="screen-title" fontSize="$4" textAlign="left">
        {title}
      </Typography>
      <YStack flex={1} height={1} backgroundColor="$accentSubtle" />
    </XStack>
  )
}

function BlockView({
  collectionId,
  block,
  depth,
}: {
  collectionId: string
  block: CollectionBlock
  depth: number
}) {
  if (block.kind === 'section') {
    return <SectionView collectionId={collectionId} section={block} depth={depth + 1} />
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
