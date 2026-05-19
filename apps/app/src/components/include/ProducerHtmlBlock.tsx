// biome-ignore-all lint/suspicious/noArrayIndexKey: rendered producer blocks never reorder

import { Fragment } from 'react'
import { Text, YStack } from 'tamagui'
import type { ProseBlock, ProseInline } from '@/content/primitives'
import { PrayerText } from '../PrayerText'

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
        <Text fontFamily="$heading" fontSize="$1" color="$colorSecondary" letterSpacing={1}>
          {block.text}
        </Text>
      )

    case 'paragraph':
      return (
        <PrayerText
          testID={block.id ? `producer-anchor-${block.id}` : undefined}
          fontWeight={block.className?.includes('heading') ? '600' : undefined}
        >
          <InlineRun nodes={block.inline} onRefPress={onRefPress} />
        </PrayerText>
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
