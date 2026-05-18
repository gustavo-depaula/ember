// biome-ignore-all lint/suspicious/noArrayIndexKey: rendered producer blocks never reorder

import { Fragment } from 'react'
import { Text, YStack } from 'tamagui'
import { PrayerText } from '../PrayerText'
import type { Block, Inline } from './htmlToBlocks'
import { htmlToBlocks } from './htmlToBlocks'

function InlineRun({ nodes, onRefPress }: { nodes: Inline[]; onRefPress?: (ref: string) => void }) {
  return (
    <>
      {nodes.map((n, i) => {
        if (n.kind === 'break') return <Fragment key={i}>{'\n'}</Fragment>
        if (n.kind === 'text') return <Fragment key={i}>{n.text}</Fragment>
        if (n.kind === 'bold')
          return (
            <Text key={i} fontWeight="700">
              {n.text}
            </Text>
          )
        if (n.kind === 'italic')
          return (
            <Text key={i} fontStyle="italic">
              {n.text}
            </Text>
          )
        return (
          <Text
            key={i}
            testID={`producer-ref-${n.ref}`}
            color="$colorMutedBlue"
            fontWeight="600"
            onPress={() => onRefPress?.(n.ref)}
          >
            {n.text}
          </Text>
        )
      })}
    </>
  )
}

function BlockView({ block, onRefPress }: { block: Block; onRefPress?: (ref: string) => void }) {
  if (block.kind === 'blockquote') {
    return (
      <YStack borderLeftWidth={3} borderLeftColor="$borderColor" paddingLeft="$md" gap="$sm">
        {block.children.map((c, i) => (
          <BlockView key={i} block={c} onRefPress={onRefPress} />
        ))}
      </YStack>
    )
  }
  return (
    <PrayerText
      testID={block.id ? `producer-anchor-${block.id}` : undefined}
      fontWeight={block.className?.includes('heading') ? '600' : undefined}
    >
      <InlineRun nodes={block.inline} onRefPress={onRefPress} />
    </PrayerText>
  )
}

export function ProducerHtmlBlock({
  html,
  onRefPress,
}: {
  html: string
  onRefPress?: (ref: string) => void
}) {
  const blocks = htmlToBlocks(html)
  return (
    <YStack gap="$md">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} onRefPress={onRefPress} />
      ))}
    </YStack>
  )
}
