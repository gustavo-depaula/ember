// biome-ignore-all lint/suspicious/noArrayIndexKey: rendered producer blocks never reorder

import { Fragment, useMemo } from 'react'
import { Text, useTheme, YStack } from 'tamagui'
import type { ProseBlock, ProseInline } from '@/content/primitives'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { PrayerText } from '../PrayerText'
import { composeStyle } from '../prayer/InlineMarkdown'
import { ReadingParagraph } from '../ReadingParagraph'

function InlineRun({
  nodes,
  onRefPress,
}: {
  nodes: ProseInline[]
  onRefPress?: (ref: string) => void
}) {
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

/**
 * A producer paragraph — the Compendium's answers, an article's body — set by
 * the Knuth–Plass pass.
 *
 * A cross-reference is not a reason to give up on the paragraph: it becomes a
 * run of its own carrying its colour and its press handler, and every piece the
 * breaker produces from that run stays tappable, including both halves when a
 * line break falls inside it. `break` is the one thing that genuinely can't
 * ride along — a hard newline is a paragraph boundary the breaker has no model
 * for — so those paragraphs render as ordinary wrapped text.
 */
function ProducerParagraph({
  nodes,
  base,
  onRefPress,
  testID,
}: {
  nodes: ProseInline[]
  base: TextStyleName
  onRefPress?: (ref: string) => void
  testID?: string
}) {
  const theme = useTheme()
  const refRender = useMemo(
    // Resolved, not a token: a run's `render` is applied as a raw RN style.
    () => ({ color: theme.colorMutedBlue?.val as string }),
    [theme.colorMutedBlue],
  )

  const source = useMemo<StyledSegment[] | undefined>(() => {
    const out: StyledSegment[] = []
    for (const n of nodes) {
      if (n.kind === 'break') return undefined
      if (n.kind === 'ref') {
        out.push({
          text: n.text,
          style: composeStyle('bold', base),
          render: refRender,
          onPress: () => onRefPress?.(n.ref),
        })
      } else if (n.kind === 'bold') {
        out.push({ text: n.text, style: composeStyle('bold', base) })
      } else if (n.kind === 'italic') {
        out.push({ text: n.text, style: composeStyle('italic', base) })
      } else {
        out.push({ text: n.text, style: base })
      }
    }
    return out
  }, [nodes, base, refRender, onRefPress])

  const inline = <InlineRun nodes={nodes} onRefPress={onRefPress} />
  if (!source) {
    return (
      <PrayerText testID={testID} fontWeight={base === 'bold' ? '600' : undefined}>
        {inline}
      </PrayerText>
    )
  }

  return <ReadingParagraph testID={testID} source={source} base={base} fallback={inline} />
}

function BlockView({
  block,
  onRefPress,
}: {
  block: ProseBlock
  onRefPress?: (ref: string) => void
}) {
  switch (block.kind) {
    case 'blockquote':
      return (
        <YStack
          borderLeftWidth={3}
          borderLeftColor="$accentSubtle"
          paddingLeft="$md"
          gap="$sm"
          // Slight top/bottom breathing room so the rule looks intentional.
          paddingVertical="$xxs"
        >
          {block.children.map((c, i) => (
            <BlockView key={i} block={c} onRefPress={onRefPress} />
          ))}
        </YStack>
      )

    case 'question':
      return (
        <PrayerText
          testID={`producer-anchor-${block.id}`}
          fontFamily="$heading"
          fontWeight="700"
          // Slightly larger than body, in the heading face, to read as a Q.
          // Tamagui's `$3` token maps to the same scale used by section
          // headings elsewhere in the app (~17pt on iOS).
          fontSize="$3"
          marginTop="$sm"
        >
          {block.number}. {block.text}
        </PrayerText>
      )

    case 'heading':
      // PART/CHAPTER/SECTION/ARTICLE — centered, Roman caps (Cinzel) since
      // the blackletter `$display` face is unreadable at heading sizes for
      // all-caps text. Source text is already uppercase; letter-spacing
      // adds the engraved-on-stone feel.
      return (
        <Text
          selectable
          fontFamily="$heading"
          fontWeight="700"
          fontSize="$4"
          color="$colorBurgundy"
          textAlign="center"
          letterSpacing={2}
          marginTop="$lg"
          marginBottom="$xs"
        >
          {block.text}
        </Text>
      )

    case 'subheading':
      // The title-case line directly after a heading (e.g. "Man's Capacity
      // for God"). One step lighter than the heading: smaller size, regular
      // weight. Same Roman caps face so the two read as a pair.
      return (
        <Text
          selectable
          fontFamily="$heading"
          fontSize="$3"
          color="$colorBurgundy"
          textAlign="center"
          marginBottom="$md"
        >
          {block.text}
        </Text>
      )

    case 'paragraph-number':
      // CCC paragraph number marker — appears just before the source's intro
      // quote for a chapter. Small + muted so it doesn't distract.
      return (
        <Text
          selectable
          fontFamily="$heading"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={1}
        >
          {block.text}
        </Text>
      )

    case 'paragraph':
      return (
        <ProducerParagraph
          testID={block.id ? `producer-anchor-${block.id}` : undefined}
          nodes={block.inline}
          base={block.className?.includes('heading') ? 'bold' : 'regular'}
          onRefPress={onRefPress}
        />
      )
  }
}

// Renders pre-parsed prose blocks (produced once by reader-kind sources and
// cached in external_content). No parsing happens here — the renderer is a
// pure walk over a typed tree.
//
// `showStructure` (default true) controls whether interstitial blocks tagged
// `structural: true` by the source render. When false the chapter/section
// dividers and the source's intro quotes drop out, leaving just the question
// content. Useful when a practice wants the answers without the
// source-document chrome.
export function ProducerHtmlBlock({
  blocks,
  onRefPress,
  showStructure = true,
}: {
  blocks: ProseBlock[]
  onRefPress?: (ref: string) => void
  showStructure?: boolean
}) {
  const visible = showStructure
    ? blocks
    : blocks.filter((b) => {
        // Plain paragraphs and questions are always shown; everything tagged
        // structural drops. (A non-structural paragraph in the middle of an
        // interstitial run is rare but stays — its content isn't chrome.)
        if (b.kind === 'question' || b.kind === 'paragraph') return true
        return !b.structural
      })
  return (
    <YStack gap="$md">
      {visible.map((b, i) => (
        <BlockView key={i} block={b} onRefPress={onRefPress} />
      ))}
    </YStack>
  )
}
