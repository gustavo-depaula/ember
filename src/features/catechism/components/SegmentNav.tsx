import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import type { CccSegment } from '../segments'

function abbreviate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

export function SegmentNav({
  segments,
  currentIndex,
  onNavigate,
}: {
  segments: CccSegment[]
  currentIndex: number
  onNavigate: (index: number) => void
}) {
  const theme = useTheme()
  const prev = currentIndex > 0 ? segments[currentIndex - 1] : undefined
  const next = currentIndex < segments.length - 1 ? segments[currentIndex + 1] : undefined

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$md">
      {prev ? (
        <Pressable onPress={() => onNavigate(prev.index)} style={{ flex: 1 }}>
          <XStack alignItems="center" gap="$xs">
            <ChevronLeft size={16} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$2" color="$accent" numberOfLines={1} flex={1}>
              {abbreviate(prev.section, 28)}
            </Text>
          </XStack>
        </Pressable>
      ) : (
        <XStack flex={1} />
      )}

      {next ? (
        <Pressable
          onPress={() => onNavigate(next.index)}
          style={{ flex: 1, alignItems: 'flex-end' }}
        >
          <XStack alignItems="center" gap="$xs">
            <Text fontFamily="$body" fontSize="$2" color="$accent" numberOfLines={1}>
              {abbreviate(next.section, 28)}
            </Text>
            <ChevronRight size={16} color={theme.accent.val} />
          </XStack>
        </Pressable>
      ) : (
        <XStack flex={1} />
      )}
    </XStack>
  )
}
