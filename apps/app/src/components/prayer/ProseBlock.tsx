// biome-ignore-all lint/suspicious/noArrayIndexKey: static parsed markdown nodes never reorder
import type { BilingualText } from '@ember/content-engine'
import { Text, YStack } from 'tamagui'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import { Typography } from '../typography'
import { ImageBlock } from './ImageBlock'
import { InlineText } from './InlineMarkdown'
import type { InlineNode } from './parseMarkdown'
import { parseMarkdown } from './parseMarkdown'

export { parseMarkdown }

export function ProseBlock({ text }: { text: BilingualText }) {
  const nodes = parseMarkdown(text.primary)
  // Long-form prose (books, catechism) follows the reader's font/size/leading.
  const reading = useReadingStyle()
  const baseFamily = reading.fontFamily as unknown as string

  return (
    <YStack gap="$md">
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'heading': {
            const fontSize = node.level === 1 ? '$5' : node.level === 2 ? '$4' : '$3'
            return (
              <Typography variant="label" key={i} fontSize={fontSize as '$3' | '$4' | '$5'}>
                {node.text}
              </Typography>
            )
          }
          case 'blockquote': {
            const paragraphs = node.children
              .reduce<InlineNode[][]>(
                (acc, n) => {
                  if (n.type === 'text' && n.text.includes('\n')) {
                    const parts = n.text.split('\n')
                    parts.forEach((part, pi) => {
                      if (pi > 0) acc.push([])
                      if (part) acc[acc.length - 1].push({ type: 'text', text: part })
                    })
                  } else {
                    acc[acc.length - 1].push(n)
                  }
                  return acc
                },
                [[]],
              )
              .filter((p) => p.length > 0)
            return (
              <YStack
                key={i}
                borderLeftWidth={3}
                borderLeftColor="$accentSubtle"
                paddingLeft="$md"
                marginLeft="$sm"
                gap="$sm"
              >
                {paragraphs.map((para, pi) => (
                  <Text key={pi} selectable {...reading} fontStyle="italic" color="$colorSecondary">
                    <InlineText nodes={para} baseFamily={baseFamily} />
                  </Text>
                ))}
              </YStack>
            )
          }
          case 'list':
            return (
              <YStack key={i} gap="$xs" paddingLeft="$md">
                {node.items.map((item, j) => (
                  <Text key={j} selectable {...reading} color="$color">
                    {node.ordered ? `${j + 1}. ` : '• '}
                    <InlineText nodes={item} baseFamily={baseFamily} />
                  </Text>
                ))}
              </YStack>
            )
          case 'image':
            return <ImageBlock key={i} src={node.src} />
          default:
            return (
              <Text key={i} selectable {...reading} color="$color">
                <InlineText nodes={node.children} baseFamily={baseFamily} />
              </Text>
            )
        }
      })}
    </YStack>
  )
}
