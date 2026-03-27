import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { OrnamentalRule } from '@/components'
import { useReadingMargin, useReadingStyle } from '@/hooks/useReadingStyle'
import type { CccParagraph } from '@/lib/catechism'

import type { CccSegment } from '../segments'

function InBriefContent({
  paragraphs,
  readingStyle,
}: {
  paragraphs: CccParagraph[]
  readingStyle: ReturnType<typeof useReadingStyle>
}) {
  return (
    <YStack gap="$xs">
      {paragraphs.map((p) => (
        <Text key={p.number} color="$color" {...readingStyle}>
          <Text
            fontSize={Math.round(readingStyle.fontSize * 0.5)}
            color="$accent"
            fontFamily="$heading"
            fontWeight="700"
          >
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
  const { t } = useTranslation()
  const readingStyle = useReadingStyle()
  const readingMargin = useReadingMargin()

  if (paragraphs.length === 0) return undefined

  const isInBrief = segment.section === 'IN BRIEF'
  const breadcrumbParts = segment.breadcrumb.slice(0, -1)

  return (
    <YStack gap="$xs" paddingVertical="$lg" paddingHorizontal={readingMargin}>
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
          {isInBrief ? t('catechism.inBrief') : segment.section}
        </Text>
        <OrnamentalRule />
      </YStack>

      {isInBrief ? (
        <InBriefContent paragraphs={paragraphs} readingStyle={readingStyle} />
      ) : (
        paragraphs.map((p) => (
          <Text key={p.number} color="$color" {...readingStyle}>
            <Text
              fontSize={Math.round(readingStyle.fontSize * 0.5)}
              color="$accent"
              fontFamily="$heading"
            >
              {p.number}
            </Text>
            {'  '}
            {p.text}
          </Text>
        ))
      )}

      <OrnamentalRule />
    </YStack>
  )
}
