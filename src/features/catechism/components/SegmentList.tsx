import { Pressable } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

import type { CccSegment } from '../segments'

function abbreviate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export function SegmentList({
  segments,
  currentSegmentIndex,
  onSelectSegment,
}: {
  segments: CccSegment[]
  currentSegmentIndex: number
  onSelectSegment: (index: number) => void
}) {
  // Show segments within the same parent chapter (breadcrumb[0..1] match)
  const current = segments[currentSegmentIndex]
  if (!current) return undefined

  const parentBreadcrumb = current.breadcrumb.slice(0, 2).join('/')

  const siblings = segments.filter((s) => s.breadcrumb.slice(0, 2).join('/') === parentBreadcrumb)

  return (
    <ScrollView flex={1}>
      <YStack paddingBottom="$xl">
        {siblings.map((seg) => {
          const isCurrent = seg.index === currentSegmentIndex

          return (
            <Pressable
              key={seg.index}
              onPress={() => onSelectSegment(seg.index)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(128,128,128,0.15)' : 'transparent',
              })}
            >
              <XStack paddingVertical={8} paddingHorizontal="$sm" gap="$sm" alignItems="center">
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  fontWeight={isCurrent ? '700' : '400'}
                  color={isCurrent ? '$accent' : '$colorSecondary'}
                  width={44}
                  textAlign="right"
                >
                  {seg.startParagraph}
                </Text>
                <Text
                  fontFamily="$body"
                  fontSize="$1"
                  color={isCurrent ? '$color' : '$colorSecondary'}
                  flex={1}
                  numberOfLines={1}
                >
                  {abbreviate(seg.section, 30)}
                </Text>
              </XStack>
            </Pressable>
          )
        })}
      </YStack>
    </ScrollView>
  )
}
