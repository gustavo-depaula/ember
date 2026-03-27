import { Text, YStack } from 'tamagui'

import { OrnamentalRule } from '@/components'
import type { CccParagraph } from '@/lib/catechism'

import type { CccSegment } from '../segments'

function InBriefContent({ paragraphs }: { paragraphs: CccParagraph[] }) {
  return (
    <YStack gap="$xs">
      {paragraphs.map((p) => (
        <Text
          key={p.number}
          fontFamily="$body"
          fontSize="$4"
          lineHeight="$4"
          color="$color"
          textAlign="justify"
        >
          <Text fontSize={10} color="$accent" fontFamily="$heading" fontWeight="700">
            {p.number}
          </Text>
          {'  '}
          {p.text}
        </Text>
      ))}
    </YStack>
  )
}

export function SegmentContent({
  segment,
  paragraphs,
}: {
  segment: CccSegment
  paragraphs: CccParagraph[]
}) {
  if (paragraphs.length === 0) return undefined

  const isInBrief = segment.section === 'IN BRIEF'
  const breadcrumbParts = segment.breadcrumb.slice(0, -1)

  return (
    <YStack gap="$xs" paddingVertical="$lg">
      {breadcrumbParts.length > 0 ? (
        <YStack alignItems="center" gap={2} paddingBottom="$lg">
          {breadcrumbParts.map((part) => (
            <Text
              key={part}
              fontFamily="$body"
              fontSize={11}
              color="$colorSecondary"
              textAlign="center"
              numberOfLines={1}
            >
              {part}
            </Text>
          ))}
        </YStack>
      ) : undefined}

      <YStack alignItems="center" gap="$sm" paddingBottom="$md">
        <Text
          fontFamily="$heading"
          fontSize={isInBrief ? 20 : 24}
          color={isInBrief ? '$accent' : '$colorSecondary'}
          textAlign="center"
          fontStyle={isInBrief ? 'italic' : 'normal'}
        >
          {isInBrief ? 'In Brief' : segment.section}
        </Text>
        <OrnamentalRule />
      </YStack>

      {isInBrief ? (
        <InBriefContent paragraphs={paragraphs} />
      ) : (
        <>
          {paragraphs.map((p) => (
            <Text
              key={p.number}
              fontFamily="$body"
              fontSize="$4"
              lineHeight="$4"
              color="$color"
              textAlign="justify"
            >
              <Text fontSize={10} color="$accent" fontFamily="$heading">
                {p.number}
              </Text>
              {'  '}
              {p.text}
            </Text>
          ))}
        </>
      )}

      <OrnamentalRule />
    </YStack>
  )
}
