// biome-ignore-all lint/suspicious/noArrayIndexKey: static prayer text lines never reorder
import { ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PrayerText } from '../PrayerText'

export function CollapsiblePrayer({
  title,
  text,
  count,
}: {
  title: string
  text: string
  count?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()

  return (
    <YStack gap="$xs">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
      >
        <XStack alignItems="center" gap="$sm">
          <ChevronRight
            size={14}
            color={theme.colorSecondary.val}
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
          <Text fontFamily="$heading" fontSize="$2" color="$color" flex={1}>
            {title}
          </Text>
          {count !== undefined && count > 1 && (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              ×{count}
            </Text>
          )}
        </XStack>
      </Pressable>
      {expanded && (
        <YStack paddingLeft="$lg" gap="$xs">
          {text.split('\n').map((line, i) => (
            <PrayerText key={`${i}-${line.slice(0, 20)}`}>{line}</PrayerText>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
