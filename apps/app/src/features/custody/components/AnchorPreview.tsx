import { Text, YStack } from 'tamagui'

import type { Anchor } from '../types'

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`
}

export function AnchorPreview({ anchor }: { anchor: Anchor | null }) {
  if (!anchor) {
    return (
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
        No anchor selected
      </Text>
    )
  }

  if (anchor.kind === 'text') {
    return (
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
          {anchor.text}
        </Text>
        {anchor.attribution && (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
            textAlign="center"
            fontStyle="italic"
          >
            — {anchor.attribution}
          </Text>
        )}
      </YStack>
    )
  }

  if (anchor.kind === 'prayer' || anchor.kind === 'lectio') {
    const heading = anchor.kind === 'prayer' ? anchor.prayerRef : anchor.reference
    return (
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$accent" textAlign="center">
          {heading}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$color" textAlign="center">
          {truncate(anchor.rendered, 120)}
        </Text>
      </YStack>
    )
  }

  if (anchor.kind === 'image') {
    return (
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$accent" textAlign="center">
          {anchor.imageRef}
        </Text>
        {anchor.caption && (
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
            textAlign="center"
            fontStyle="italic"
          >
            {anchor.caption}
          </Text>
        )}
      </YStack>
    )
  }

  return (
    <Text
      fontFamily="$body"
      fontSize="$2"
      color="$colorSecondary"
      textAlign="center"
      fontStyle="italic"
    >
      Silence
    </Text>
  )
}
