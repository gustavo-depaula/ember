// biome-ignore-all lint/suspicious/noArrayIndexKey: static parsed markdown nodes never reorder
import type { BilingualText } from '@ember/content-engine'
import { type ComponentProps, useMemo } from 'react'
import { type Text, YStack } from 'tamagui'
import { ReadingParagraph } from '@/components/ReadingParagraph'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { Typography } from '../typography'
import { ImageBlock } from './ImageBlock'
import { composeStyle, InlineText } from './InlineMarkdown'
import type { InlineNode } from './parseMarkdown'
import { parseMarkdown } from './parseMarkdown'

export { parseMarkdown }

/**
 * One prose paragraph, broken by the same Knuth–Plass pass the prayer surface
 * uses rather than by the platform's greedy justifier.
 *
 * `textAlign: 'justify'` on a native `Text` fills each line in turn and never
 * hyphenates, which at book-paragraph length is the failure justification
 * exists to prevent: rivers of whitespace down the page. `JustifiedText`
 * optimizes the paragraph whole and hyphenates in the content's own language,
 * and falls back to ordinary wrapped text whenever the line model isn't
 * available. See `docs/design/typography-justification.md`.
 */
function ProseParagraph({
  nodes,
  base = 'regular',
  color = '$color',
  // A list bullet or number, drawn inline. It has to reach the justifier as a
  // real segment, or the first line is measured a marker too narrow.
  marker,
}: {
  nodes: InlineNode[]
  base?: TextStyleName
  color?: ComponentProps<typeof Text>['color']
  marker?: string
}) {
  const reading = useReadingStyle()
  const baseFamily = reading.fontFamily as unknown as string

  const source = useMemo<StyledSegment[]>(() => {
    const segments = nodes.map((node) => ({
      text: node.text,
      style: composeStyle(node.type, base),
    }))
    return marker ? [{ text: marker, style: base }, ...segments] : segments
  }, [nodes, base, marker])

  return (
    <ReadingParagraph
      source={source}
      base={base}
      color={color}
      // Where justification declines, the paragraph still has to render with
      // its emphasis intact.
      fallback={
        <>
          {marker}
          <InlineText nodes={nodes} baseFamily={baseFamily} base={base} />
        </>
      }
    />
  )
}

// A blockquote's inner paragraph breaks are newlines inside its text nodes,
// since `parseMarkdown` keeps the quote as one run of inline nodes.
function ProseBlockquote({ nodes }: { nodes: InlineNode[] }) {
  const paragraphs = useMemo(
    () =>
      nodes
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
        .filter((p) => p.length > 0),
    [nodes],
  )

  return (
    <YStack
      borderLeftWidth={3}
      borderLeftColor="$accentSubtle"
      paddingLeft="$md"
      marginLeft="$sm"
      gap="$sm"
    >
      {paragraphs.map((para, pi) => (
        <ProseParagraph key={pi} nodes={para} base="italic" color="$colorSecondary" />
      ))}
    </YStack>
  )
}

export function ProseBlock({ text }: { text: BilingualText }) {
  // Stable node identities, so the justifier's per-paragraph memo survives a
  // re-render instead of re-breaking every paragraph.
  const nodes = useMemo(() => parseMarkdown(text.primary), [text.primary])

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
          case 'blockquote':
            return <ProseBlockquote key={i} nodes={node.children} />
          case 'list':
            return (
              <YStack key={i} gap="$xs" paddingLeft="$md">
                {node.items.map((item, j) => (
                  <ProseParagraph
                    key={j}
                    nodes={item}
                    marker={node.ordered ? `${j + 1}. ` : '• '}
                  />
                ))}
              </YStack>
            )
          case 'image':
            return <ImageBlock key={i} src={node.src} />
          default:
            return <ProseParagraph key={i} nodes={node.children} />
        }
      })}
    </YStack>
  )
}
