// biome-ignore-all lint/suspicious/noArrayIndexKey: static parsed markdown nodes never reorder
import type { BilingualText } from '@ember/content-engine'
import { Fragment } from 'react'
import { Text, YStack } from 'tamagui'

type ProseNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: number; text: string }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }

type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'bolditalic'; text: string }

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match = regex.exec(text)

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }
    if (match[1]) nodes.push({ type: 'bolditalic', text: match[1] })
    else if (match[2]) nodes.push({ type: 'bold', text: match[2] })
    else if (match[3]) nodes.push({ type: 'italic', text: match[3] })
    lastIndex = regex.lastIndex
    match = regex.exec(text)
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text }]
}

export function parseMarkdown(markdown: string): ProseNode[] {
  const lines = markdown.split('\n')
  const nodes: ProseNode[] = []
  let paragraph: string[] = []
  let listItems: InlineNode[][] = []
  let listOrdered = false

  function flushParagraph() {
    if (paragraph.length > 0) {
      const text = paragraph.join(' ').trim()
      if (text) nodes.push({ type: 'paragraph', children: parseInline(text) })
      paragraph = []
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      nodes.push({ type: 'list', ordered: listOrdered, items: listItems })
      listItems = []
      listOrdered = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      nodes.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      continue
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph()
      flushList()
      nodes.push({ type: 'blockquote', children: parseInline(trimmed.slice(2)) })
      continue
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/)
    if (unorderedMatch) {
      flushParagraph()
      if (listItems.length > 0 && listOrdered) flushList()
      listOrdered = false
      listItems.push(parseInline(unorderedMatch[1]))
      continue
    }

    const orderedMatch = trimmed.match(/^\d+\.[°ª]?\s+(.+)$/)
    if (orderedMatch) {
      flushParagraph()
      if (listItems.length > 0 && !listOrdered) flushList()
      listOrdered = true
      listItems.push(parseInline(orderedMatch[1]))
      continue
    }

    flushList()
    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  return nodes
}

function InlineText({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'bold':
            return (
              <Text key={i} fontFamily="$body" fontWeight="700">
                {node.text}
              </Text>
            )
          case 'italic':
            return (
              <Text key={i} fontFamily="$body" fontStyle="italic">
                {node.text}
              </Text>
            )
          case 'bolditalic':
            return (
              <Text key={i} fontFamily="$body" fontWeight="700" fontStyle="italic">
                {node.text}
              </Text>
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
          case 'blockquote':
            return (
              <YStack
                key={i}
                borderLeftWidth={3}
                borderLeftColor="$accentSubtle"
                paddingLeft="$md"
                marginLeft="$sm"
              >
                <Text fontFamily="$body" fontSize="$3" fontStyle="italic" color="$colorSecondary">
                  <InlineText nodes={node.children} />
                </Text>
              </YStack>
            )
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
