// biome-ignore-all lint/suspicious/noArrayIndexKey: static parsed markdown nodes never reorder
import type { BilingualText } from '@ember/content-engine'
import { Fragment } from 'react'
import { Text as RNText } from 'react-native'
import { Text, YStack } from 'tamagui'
import { bodyFont } from '@/config/fonts'
import { ImageBlock } from './ImageBlock'
import type { InlineNode } from './parseMarkdown'
import { parseMarkdown } from './parseMarkdown'

export { parseMarkdown }

// React Native's Text ignores inherited fontWeight/fontStyle when setting fontFamily,
// so nested <Text fontWeight="700"> inside Tamagui Text doesn't swap the font face.
// Resolve the concrete RN font family directly from the font's face map.
function bodyFace(weight: 400 | 700, italic: boolean): string {
  const variants = bodyFont.face?.[weight]
  return (italic ? variants?.italic : variants?.normal) ?? bodyFont.family
}

function InlineText({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'bold':
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(700, false) }}>
                {node.text}
              </RNText>
            )
          case 'italic':
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(400, true) }}>
                {node.text}
              </RNText>
            )
          case 'bolditalic':
            return (
              <RNText key={i} style={{ fontFamily: bodyFace(700, true) }}>
                {node.text}
              </RNText>
            )
          default:
            return <Fragment key={i}>{node.text}</Fragment>
        }
      })}
    </>
  )
}

export function ProseBlock({ text }: { text: BilingualText }) {
  const nodes = parseMarkdown(text.primary)

  return (
    <YStack gap="$md">
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'heading': {
            const fontSize = node.level === 1 ? '$5' : node.level === 2 ? '$4' : '$3'
            return (
              <Text
                key={i}
                fontFamily="$heading"
                fontSize={fontSize as '$3' | '$4' | '$5'}
                color="$colorBurgundy"
                letterSpacing={0.5}
              >
                {node.text}
              </Text>
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
                  <Text
                    key={pi}
                    fontFamily="$body"
                    fontSize="$3"
                    fontStyle="italic"
                    color="$colorSecondary"
                  >
                    <InlineText nodes={para} />
                  </Text>
                ))}
              </YStack>
            )
          }
          case 'list':
            return (
              <YStack key={i} gap="$xs" paddingLeft="$md">
                {node.items.map((item, j) => (
                  <Text key={j} fontFamily="$body" fontSize="$3" color="$color">
                    {node.ordered ? `${j + 1}. ` : '\u2022 '}
                    <InlineText nodes={item} />
                  </Text>
                ))}
              </YStack>
            )
          case 'image':
            return <ImageBlock key={i} src={node.src} />
          default:
            return (
              <Text key={i} fontFamily="$body" fontSize="$3" color="$color">
                <InlineText nodes={node.children} />
              </Text>
            )
        }
      })}
    </YStack>
  )
}
